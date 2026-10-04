import express, { Request, Response, NextFunction } from 'express';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Enable CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Database Workbook Path
const EXCEL_PATH = fs.existsSync(path.resolve(__dirname, 'backend/hospital_database.xlsx'))
  ? path.resolve(__dirname, 'backend/hospital_database.xlsx')
  : path.resolve(__dirname, 'hospital_database.xlsx');

const SCHEMAS: Record<string, string[]> = {
  Patients: [
    'id', 'fullName', 'age', 'gender', 'phone', 'email',
    'bloodGroup', 'address', 'emergencyContact', 'department',
    'assignedDoctor', 'registrationDate', 'status', 'notes'
  ],
  Doctors: [
    'id', 'name', 'specialization', 'department', 'phone', 'email',
    'experience', 'availability', 'consultationFee', 'status',
    'room', 'qualification'
  ],
  Appointments: [
    'id', 'patientId', 'patientName', 'doctorId', 'doctorName',
    'department', 'appointmentDate', 'appointmentTime', 'reason',
    'status', 'tokenNumber'
  ],
  Admissions: [
    'id', 'patientId', 'patientName', 'roomNumber', 'bedNumber',
    'department', 'doctor', 'admissionDate', 'expectedDischarge',
    'actualDischarge', 'status', 'wardType'
  ],
  Medicines: [
    'id', 'name', 'category', 'quantity', 'unitPrice', 'expiryDate',
    'supplier', 'stockStatus', 'dosage', 'batchNumber'
  ],
  Bills: [
    'id', 'patientId', 'patientName', 'consultationFee',
    'medicineCharges', 'roomCharges', 'otherCharges', 'totalAmount',
    'paymentStatus', 'billingDate', 'paymentMethod', 'insuranceProvider'
  ]
};

// Excel Helpers
async function readSheetRecords(sheetName: string): Promise<Record<string, any>[]> {
  if (!fs.existsSync(EXCEL_PATH)) return [];
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);
  const ws = wb.getWorksheet(sheetName);
  if (!ws) return [];

  const headers: string[] = [];
  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = String(cell.value || '').trim();
  });

  const records: Record<string, any>[] = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const firstVal = row.getCell(1).value;
    if (!firstVal) continue;

    const record: Record<string, any> = {};
    headers.forEach((header, colIdx) => {
      if (!header) return;
      let val = row.getCell(colIdx).value;
      if (val === null || val === undefined) {
        val = '';
      } else if (typeof val === 'object' && val !== null && 'text' in val) {
        val = (val as any).text;
      }
      if (['age', 'quantity', 'tokenNumber'].includes(header) && val !== '') {
        const parsed = parseInt(String(val), 10);
        val = isNaN(parsed) ? val : parsed;
      } else if (['unitPrice', 'consultationFee', 'medicineCharges', 'roomCharges', 'otherCharges', 'totalAmount'].includes(header) && val !== '') {
        const parsed = parseFloat(String(val));
        val = isNaN(parsed) ? val : parsed;
      }
      record[header] = val;
    });
    records.push(record);
  }
  return records;
}

async function appendSheetRecord(sheetName: string, record: Record<string, any>): Promise<Record<string, any>> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);
  let ws = wb.getWorksheet(sheetName);
  const headers = SCHEMAS[sheetName];
  if (!ws) {
    ws = wb.addWorksheet(sheetName);
    ws.addRow(headers);
  }

  const rowValues = headers.map(h => (record[h] !== undefined && record[h] !== null ? record[h] : ''));
  ws.addRow(rowValues);
  await wb.xlsx.writeFile(EXCEL_PATH);
  return record;
}

async function updateSheetRecord(sheetName: string, id: string, updatedFields: Record<string, any>): Promise<Record<string, any> | null> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);
  const ws = wb.getWorksheet(sheetName);
  if (!ws) return null;

  const headers = SCHEMAS[sheetName];
  let targetRowIndex = -1;

  for (let r = 2; r <= ws.rowCount; r++) {
    const cellVal = String(ws.getRow(r).getCell(1).value || '').trim();
    if (cellVal === String(id).trim()) {
      targetRowIndex = r;
      break;
    }
  }

  if (targetRowIndex === -1) return null;

  const targetRow = ws.getRow(targetRowIndex);
  headers.forEach((header, idx) => {
    if (updatedFields[header] !== undefined) {
      targetRow.getCell(idx + 1).value = updatedFields[header];
    }
  });
  targetRow.commit();
  await wb.xlsx.writeFile(EXCEL_PATH);

  const updatedRecord: Record<string, any> = {};
  headers.forEach((header, idx) => {
    updatedRecord[header] = targetRow.getCell(idx + 1).value ?? '';
  });
  return updatedRecord;
}

async function deleteSheetRecord(sheetName: string, id: string): Promise<boolean> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);
  const ws = wb.getWorksheet(sheetName);
  if (!ws) return false;

  let targetRowIndex = -1;
  for (let r = 2; r <= ws.rowCount; r++) {
    const cellVal = String(ws.getRow(r).getCell(1).value || '').trim();
    if (cellVal === String(id).trim()) {
      targetRowIndex = r;
      break;
    }
  }

  if (targetRowIndex === -1) return false;

  ws.spliceRows(targetRowIndex, 1);
  await wb.xlsx.writeFile(EXCEL_PATH);
  return true;
}

async function generateUniqueId(sheetName: string, prefix: string, startNumber: number): Promise<string> {
  const records = await readSheetRecords(sheetName);
  let maxNum = startNumber;
  for (const r of records) {
    const val = String(r.id || '');
    if (val.startsWith(prefix)) {
      const num = parseInt(val.replace(prefix, ''), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  return `${prefix}${maxNum + 1}`;
}

// -------------------------------------------------------------
// 1. PATIENTS API
// -------------------------------------------------------------
app.get('/api/patients', async (req: Request, res: Response) => {
  try {
    const patients = await readSheetRecords('Patients');
    res.json(patients);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read Patients from Excel', details: err.message });
  }
});

app.post('/api/patients', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data || !data.fullName || !data.fullName.trim()) {
      res.status(400).json({ error: "Field 'fullName' is required" });
      return;
    }

    const patientId = data.id || await generateUniqueId('Patients', 'PAT-', 1000);
    const newPatient = {
      id: patientId,
      fullName: String(data.fullName).trim(),
      age: !isNaN(parseInt(data.age, 10)) ? parseInt(data.age, 10) : 30,
      gender: data.gender || 'Male',
      phone: data.phone || '',
      email: data.email || '',
      bloodGroup: data.bloodGroup || 'O+',
      address: data.address || '',
      emergencyContact: data.emergencyContact || '',
      department: data.department || 'General Medicine',
      assignedDoctor: data.assignedDoctor || 'Dr. Julian Hayes',
      registrationDate: data.registrationDate || new Date().toISOString().split('T')[0],
      status: data.status || 'Active',
      notes: data.notes || ''
    };

    const saved = await appendSheetRecord('Patients', newPatient);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save patient to Excel workbook', details: err.message });
  }
});

app.put('/api/patients/:id', async (req: Request, res: Response) => {
  try {
    const updated = await updateSheetRecord('Patients', req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: `Patient '${req.params.id}' not found in Excel` });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update patient', details: err.message });
  }
});

app.delete('/api/patients/:id', async (req: Request, res: Response) => {
  try {
    const success = await deleteSheetRecord('Patients', req.params.id);
    if (!success) {
      res.status(404).json({ error: `Patient '${req.params.id}' not found` });
      return;
    }
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete patient', details: err.message });
  }
});

// -------------------------------------------------------------
// 2. DOCTORS API
// -------------------------------------------------------------
app.get('/api/doctors', async (req: Request, res: Response) => {
  try {
    const doctors = await readSheetRecords('Doctors');
    res.json(doctors);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read Doctors', details: err.message });
  }
});

app.post('/api/doctors', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.name) {
      res.status(400).json({ error: "Field 'name' is required" });
      return;
    }
    const docId = data.id || await generateUniqueId('Doctors', 'DOC-', 200);
    const newDoc = {
      id: docId,
      name: String(data.name).trim(),
      specialization: data.specialization || 'General Medicine',
      department: data.department || 'General Medicine',
      phone: data.phone || '',
      email: data.email || '',
      experience: data.experience || '5 Years',
      availability: data.availability || 'Available',
      consultationFee: parseFloat(data.consultationFee) || 100,
      status: data.status || 'Active',
      room: data.room || 'Room 101',
      qualification: data.qualification || 'MD'
    };
    const saved = await appendSheetRecord('Doctors', newDoc);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save doctor', details: err.message });
  }
});

app.put('/api/doctors/:id', async (req: Request, res: Response) => {
  try {
    const updated = await updateSheetRecord('Doctors', req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Doctor not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update doctor', details: err.message });
  }
});

app.delete('/api/doctors/:id', async (req: Request, res: Response) => {
  try {
    const success = await deleteSheetRecord('Doctors', req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Doctor not found' });
      return;
    }
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete doctor', details: err.message });
  }
});

// -------------------------------------------------------------
// 3. APPOINTMENTS API
// -------------------------------------------------------------
app.get('/api/appointments', async (req: Request, res: Response) => {
  try {
    const apts = await readSheetRecords('Appointments');
    res.json(apts);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read Appointments', details: err.message });
  }
});

app.post('/api/appointments', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const aptId = data.id || await generateUniqueId('Appointments', 'APT-', 3000);
    const existing = await readSheetRecords('Appointments');
    const newApt = {
      id: aptId,
      patientId: data.patientId || 'PAT-1001',
      patientName: data.patientName || '',
      doctorId: data.doctorId || 'DOC-201',
      doctorName: data.doctorName || '',
      department: data.department || 'General Medicine',
      appointmentDate: data.appointmentDate || new Date().toISOString().split('T')[0],
      appointmentTime: data.appointmentTime || '10:00 AM',
      reason: data.reason || 'Consultation',
      status: data.status || 'Scheduled',
      tokenNumber: data.tokenNumber || (existing.length + 1)
    };
    const saved = await appendSheetRecord('Appointments', newApt);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save appointment', details: err.message });
  }
});

app.put('/api/appointments/:id', async (req: Request, res: Response) => {
  try {
    const updated = await updateSheetRecord('Appointments', req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update appointment', details: err.message });
  }
});

app.delete('/api/appointments/:id', async (req: Request, res: Response) => {
  try {
    const success = await deleteSheetRecord('Appointments', req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete appointment', details: err.message });
  }
});

// -------------------------------------------------------------
// 4. ADMISSIONS API
// -------------------------------------------------------------
app.get('/api/admissions', async (req: Request, res: Response) => {
  try {
    const adms = await readSheetRecords('Admissions');
    res.json(adms);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read Admissions', details: err.message });
  }
});

app.post('/api/admissions', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const admId = data.id || await generateUniqueId('Admissions', 'ADM-', 400);
    const newAdm = {
      id: admId,
      patientId: data.patientId || 'PAT-1001',
      patientName: data.patientName || '',
      roomNumber: data.roomNumber || 'Room 201',
      bedNumber: data.bedNumber || 'B-01',
      department: data.department || 'General Medicine',
      doctor: data.doctor || '',
      admissionDate: data.admissionDate || new Date().toISOString().split('T')[0],
      expectedDischarge: data.expectedDischarge || '',
      actualDischarge: data.actualDischarge || '',
      status: data.status || 'Admitted',
      wardType: data.wardType || 'General'
    };
    const saved = await appendSheetRecord('Admissions', newAdm);
    if (newAdm.patientId) {
      await updateSheetRecord('Patients', newAdm.patientId, { status: 'Inpatient' });
    }
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save admission', details: err.message });
  }
});

app.put('/api/admissions/:id', async (req: Request, res: Response) => {
  try {
    const updated = await updateSheetRecord('Admissions', req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Admission not found' });
      return;
    }
    if (req.body.status === 'Discharged' && updated.patientId) {
      await updateSheetRecord('Patients', updated.patientId, { status: 'Discharged' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update admission', details: err.message });
  }
});

app.delete('/api/admissions/:id', async (req: Request, res: Response) => {
  try {
    const success = await deleteSheetRecord('Admissions', req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Admission not found' });
      return;
    }
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete admission', details: err.message });
  }
});

// -------------------------------------------------------------
// 5. MEDICINES API
// -------------------------------------------------------------
app.get('/api/medicines', async (req: Request, res: Response) => {
  try {
    const meds = await readSheetRecords('Medicines');
    res.json(meds);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read Medicines', details: err.message });
  }
});

app.post('/api/medicines', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const medId = data.id || await generateUniqueId('Medicines', 'MED-', 500);
    const qty = parseInt(data.quantity, 10) || 50;
    const stockStatus = qty <= 10 ? 'Critical' : qty <= 25 ? 'Low Stock' : 'In Stock';
    const newMed = {
      id: medId,
      name: String(data.name || '').trim(),
      category: data.category || 'General',
      quantity: qty,
      unitPrice: parseFloat(data.unitPrice) || 10.0,
      expiryDate: data.expiryDate || '',
      supplier: data.supplier || '',
      stockStatus: data.stockStatus || stockStatus,
      dosage: data.dosage || '',
      batchNumber: data.batchNumber || `LOT-${new Date().getFullYear()}`
    };
    const saved = await appendSheetRecord('Medicines', newMed);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save medicine', details: err.message });
  }
});

app.put('/api/medicines/:id', async (req: Request, res: Response) => {
  try {
    if (req.body.quantity !== undefined && !req.body.stockStatus) {
      const q = parseInt(req.body.quantity, 10);
      req.body.stockStatus = q <= 10 ? 'Critical' : q <= 25 ? 'Low Stock' : 'In Stock';
    }
    const updated = await updateSheetRecord('Medicines', req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Medicine not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update medicine', details: err.message });
  }
});

app.delete('/api/medicines/:id', async (req: Request, res: Response) => {
  try {
    const success = await deleteSheetRecord('Medicines', req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Medicine not found' });
      return;
    }
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete medicine', details: err.message });
  }
});

// -------------------------------------------------------------
// 6. BILLS API
// -------------------------------------------------------------
app.get('/api/bills', async (req: Request, res: Response) => {
  try {
    const bills = await readSheetRecords('Bills');
    res.json(bills);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read Bills', details: err.message });
  }
});

app.post('/api/bills', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const billId = data.id || await generateUniqueId('Bills', 'INV-', 8000);
    const c = parseFloat(data.consultationFee) || 0;
    const m = parseFloat(data.medicineCharges) || 0;
    const r = parseFloat(data.roomCharges) || 0;
    const o = parseFloat(data.otherCharges) || 0;
    const total = data.totalAmount !== undefined ? parseFloat(data.totalAmount) : (c + m + r + o);

    const newBill = {
      id: billId,
      patientId: data.patientId || 'PAT-1001',
      patientName: data.patientName || '',
      consultationFee: c,
      medicineCharges: m,
      roomCharges: r,
      otherCharges: o,
      totalAmount: total,
      paymentStatus: data.paymentStatus || 'Pending',
      billingDate: data.billingDate || new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod || 'Credit Card',
      insuranceProvider: data.insuranceProvider || ''
    };
    const saved = await appendSheetRecord('Bills', newBill);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save bill', details: err.message });
  }
});

app.put('/api/bills/:id', async (req: Request, res: Response) => {
  try {
    const updated = await updateSheetRecord('Bills', req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update bill', details: err.message });
  }
});

app.delete('/api/bills/:id', async (req: Request, res: Response) => {
  try {
    const success = await deleteSheetRecord('Bills', req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete bill', details: err.message });
  }
});

// Vite Dev Server / Static File Serving
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AuraCare HMS] Full-stack Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[AuraCare HMS] Excel Database: ${EXCEL_PATH}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
