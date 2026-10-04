import {
  Patient,
  Doctor,
  Appointment,
  Admission,
  Medicine,
  Bill
} from '../types';
import {
  initialPatients,
  initialDoctors,
  initialAppointments,
  initialAdmissions,
  initialMedicines,
  initialBills
} from '../data/mockData';
import {
  readSheetRecords,
  appendSheetRecord,
  updateSheetRecord,
  deleteSheetRecord,
  getConnectedSpreadsheetId
} from './googleSheetsService';
import { getAccessToken } from './googleAuth';

// Helper to check if Google Sheets is currently active
export const isGoogleSheetsEnabled = async (): Promise<boolean> => {
  const token = await getAccessToken();
  const id = getConnectedSpreadsheetId();
  return Boolean(token && id);
};

// Configuration: If VITE_API_URL or localStorage is set, the API service will forward requests to the live backend.
// Otherwise it operates in high-fidelity mock mode with simulated REST latency.
export const getActiveApiUrl = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('AURACARE_API_URL');
    if (saved && saved.trim()) return saved.trim().replace(/\/$/, '');
  }
  return ((import.meta.env.VITE_API_URL as string) || '/api').trim().replace(/\/$/, '');
};

let API_BASE_URL = getActiveApiUrl();

export const setActiveApiUrl = (url: string): void => {
  const clean = url.trim().replace(/\/$/, '');
  API_BASE_URL = clean || '/api';
  if (typeof window !== 'undefined' && window.localStorage) {
    if (clean) {
      window.localStorage.setItem('AURACARE_API_URL', clean);
    } else {
      window.localStorage.removeItem('AURACARE_API_URL');
    }
  }
};

// Internal in-memory stores for mock fallback mode (persists during session in memory)
let patientsStore: Patient[] = [...initialPatients];
let doctorsStore: Doctor[] = [...initialDoctors];
let appointmentsStore: Appointment[] = [...initialAppointments];
let admissionsStore: Admission[] = [...initialAdmissions];
let medicinesStore: Medicine[] = [...initialMedicines];
let billsStore: Bill[] = [...initialBills];

// Helper to simulate network latency for realistic loading states
const simulateLatency = (ms = 250): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * =========================================================================
 * PATIENT SERVICE FUNCTIONS
 * Maps to Google Sheets 'Patients' tab or /api/patients
 * =========================================================================
 */
export async function getPatients(): Promise<Patient[]> {
  if (await isGoogleSheetsEnabled()) {
    try {
      const records = await readSheetRecords<Patient>('Patients');
      if (records && records.length > 0) {
        patientsStore = records;
        return records;
      }
    } catch (err) {
      console.warn('Google Sheets read failed, falling back to Excel backend:', err);
    }
  }

  const apiUrl = getActiveApiUrl();
  try {
    const response = await fetch(`${apiUrl}/patients`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || err.details || `HTTP error ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      patientsStore = data;
      return data;
    } else if (Array.isArray(data)) {
      // If workbook exists but is empty, use initial patients or empty
      if (patientsStore.length > 0) return patientsStore;
      return [];
    }
  } catch (err) {
    console.warn('Backend unavailable, falling back to cached patient store:', err);
  }

  return [...patientsStore];
}

export async function addPatient(patientData: Omit<Patient, 'id'> & { id?: string }): Promise<Patient> {
  if (!patientData.fullName || !patientData.fullName.trim()) {
    throw new Error("Field 'fullName' is required.");
  }

  const apiUrl = getActiveApiUrl();
  let created: Patient | null = null;

  try {
    const response = await fetch(`${apiUrl}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData.error || errData.details || `Backend returned error ${response.status}: ${response.statusText}`;
      throw new Error(msg);
    }

    created = await response.json();
  } catch (backendErr: any) {
    console.error('Error in POST /api/patients:', backendErr);
    // Crucial: Throw the error so the UI modal stays open and shows the actual error message
    throw backendErr;
  }

  if (created) {
    // If Google Sheets is also connected, append to Google Sheets
    if (await isGoogleSheetsEnabled()) {
      try {
        await appendSheetRecord('Patients', created);
      } catch (err) {
        console.warn('Google Sheets sync error:', err);
      }
    }

    // Keep store updated
    patientsStore = [created, ...patientsStore.filter((p) => p.id !== created!.id)];
    return created;
  }

  throw new Error('Failed to create patient record in backend Excel database');
}

export async function updatePatient(id: string, updatedFields: Partial<Patient>): Promise<Patient> {
  const apiUrl = getActiveApiUrl();
  try {
    const response = await fetch(`${apiUrl}/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update patient: ${response.statusText}`);
    }

    const updated = await response.json();
    if (await isGoogleSheetsEnabled()) {
      try {
        await updateSheetRecord('Patients', id, updated);
      } catch (err) {
        console.warn('Google Sheets update failed:', err);
      }
    }

    patientsStore = patientsStore.map((p) => (p.id === id ? updated : p));
    return updated;
  } catch (err) {
    console.error('Backend update failed:', err);
    throw err;
  }
}

export async function deletePatient(id: string): Promise<{ success: boolean; id: string }> {
  const apiUrl = getActiveApiUrl();
  try {
    const response = await fetch(`${apiUrl}/patients/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to delete patient: ${response.statusText}`);
    }

    const result = await response.json();
    if (await isGoogleSheetsEnabled()) {
      try {
        await deleteSheetRecord('Patients', id);
      } catch (err) {
        console.warn('Google Sheets delete failed:', err);
      }
    }

    patientsStore = patientsStore.filter((p) => p.id !== id);
    return { success: true, id };
  } catch (err) {
    console.error('Backend delete failed:', err);
    throw err;
  }
}

/**
 * =========================================================================
 * DOCTOR SERVICE FUNCTIONS
 * Maps to Google Sheets 'Doctors' tab or /api/doctors
 * =========================================================================
 */
export async function getDoctors(): Promise<Doctor[]> {
  if (await isGoogleSheetsEnabled()) {
    try {
      const records = await readSheetRecords<Doctor>('Doctors');
      if (records && records.length > 0) {
        doctorsStore = records;
        return records;
      }
    } catch (err) {
      console.warn('Google Sheets read failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      doctorsStore = data;
      return data;
    } catch (err) {
      console.warn('Backend unavailable, falling back to mock data store:', err);
    }
  }
  await simulateLatency();
  return [...doctorsStore];
}

export async function addDoctor(doctorData: Omit<Doctor, 'id'> & { id?: string }): Promise<Doctor> {
  const newDoctor: Doctor = {
    ...doctorData,
    id: doctorData.id || `DOC-${200 + doctorsStore.length + 1}`
  };

  if (await isGoogleSheetsEnabled()) {
    try {
      await appendSheetRecord('Doctors', newDoctor);
      doctorsStore = [newDoctor, ...doctorsStore];
      return newDoctor;
    } catch (err) {
      console.warn('Google Sheets append failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoctor)
      });
      if (!response.ok) throw new Error(`Failed to save doctor: ${response.statusText}`);
      const created = await response.json();
      doctorsStore = [created, ...doctorsStore];
      return created;
    } catch (err) {
      console.warn('Backend unavailable, saving doctor to mock store:', err);
    }
  }

  await simulateLatency();
  doctorsStore = [newDoctor, ...doctorsStore];
  return newDoctor;
}

export async function updateDoctor(id: string, updatedFields: Partial<Doctor>): Promise<Doctor> {
  const index = doctorsStore.findIndex((d) => d.id === id);
  const existing = index !== -1 ? doctorsStore[index] : ({} as Doctor);
  const updated = { ...existing, ...updatedFields, id };

  if (await isGoogleSheetsEnabled()) {
    try {
      await updateSheetRecord('Doctors', id, updated);
      if (index !== -1) doctorsStore[index] = updated;
      return updated;
    } catch (err) {
      console.warn('Google Sheets update failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!response.ok) throw new Error(`Failed to update doctor: ${response.statusText}`);
      const resData = await response.json();
      if (index !== -1) doctorsStore[index] = resData;
      return resData;
    } catch (err) {
      console.warn('Backend unavailable, updating doctor in mock store:', err);
    }
  }

  await simulateLatency();
  if (index === -1) throw new Error(`Doctor with ID ${id} not found.`);
  doctorsStore[index] = updated;
  return updated;
}

export async function deleteDoctor(id: string): Promise<{ success: boolean; id: string }> {
  if (await isGoogleSheetsEnabled()) {
    try {
      await deleteSheetRecord('Doctors', id);
      doctorsStore = doctorsStore.filter((d) => d.id !== id);
      return { success: true, id };
    } catch (err) {
      console.warn('Google Sheets delete failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`Failed to delete doctor: ${response.statusText}`);
      doctorsStore = doctorsStore.filter((d) => d.id !== id);
      return await response.json();
    } catch (err) {
      console.warn('Backend unavailable, deleting doctor from mock store:', err);
    }
  }

  await simulateLatency();
  doctorsStore = doctorsStore.filter((d) => d.id !== id);
  return { success: true, id };
}

/**
 * =========================================================================
 * APPOINTMENT SERVICE FUNCTIONS
 * Maps to Google Sheets 'Appointments' tab or /api/appointments
 * =========================================================================
 */
export async function getAppointments(): Promise<Appointment[]> {
  if (await isGoogleSheetsEnabled()) {
    try {
      const records = await readSheetRecords<Appointment>('Appointments');
      if (records && records.length > 0) {
        appointmentsStore = records;
        return records;
      }
    } catch (err) {
      console.warn('Google Sheets read failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      appointmentsStore = data;
      return data;
    } catch (err) {
      console.warn('Backend unavailable, falling back to mock appointments:', err);
    }
  }
  await simulateLatency();
  return [...appointmentsStore];
}

export async function addAppointment(appointmentData: Omit<Appointment, 'id'> & { id?: string }): Promise<Appointment> {
  const newAppointment: Appointment = {
    ...appointmentData,
    id: appointmentData.id || `APT-${3000 + appointmentsStore.length + 1}`,
    tokenNumber: appointmentsStore.length + 1
  };

  if (await isGoogleSheetsEnabled()) {
    try {
      await appendSheetRecord('Appointments', newAppointment);
      appointmentsStore = [newAppointment, ...appointmentsStore];
      return newAppointment;
    } catch (err) {
      console.warn('Google Sheets append failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      });
      if (!response.ok) throw new Error(`Failed to book appointment: ${response.statusText}`);
      const created = await response.json();
      appointmentsStore = [created, ...appointmentsStore];
      return created;
    } catch (err) {
      console.warn('Backend unavailable, booking in mock store:', err);
    }
  }

  await simulateLatency();
  appointmentsStore = [newAppointment, ...appointmentsStore];
  return newAppointment;
}

export async function updateAppointment(id: string, updatedFields: Partial<Appointment>): Promise<Appointment> {
  const index = appointmentsStore.findIndex((a) => a.id === id);
  const existing = index !== -1 ? appointmentsStore[index] : ({} as Appointment);
  const updated = { ...existing, ...updatedFields, id };

  if (await isGoogleSheetsEnabled()) {
    try {
      await updateSheetRecord('Appointments', id, updated);
      if (index !== -1) appointmentsStore[index] = updated;
      return updated;
    } catch (err) {
      console.warn('Google Sheets update failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!response.ok) throw new Error(`Failed to update appointment: ${response.statusText}`);
      const resData = await response.json();
      if (index !== -1) appointmentsStore[index] = resData;
      return resData;
    } catch (err) {
      console.warn('Backend unavailable, updating mock appointment store:', err);
    }
  }

  await simulateLatency();
  if (index === -1) throw new Error(`Appointment with ID ${id} not found.`);
  appointmentsStore[index] = updated;
  return updated;
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  return updateAppointment(id, { status: 'Cancelled' });
}

/**
 * =========================================================================
 * ADMISSION SERVICE FUNCTIONS
 * Maps to Google Sheets 'Admissions' tab or /api/admissions
 * =========================================================================
 */
export async function getAdmissions(): Promise<Admission[]> {
  if (await isGoogleSheetsEnabled()) {
    try {
      const records = await readSheetRecords<Admission>('Admissions');
      if (records && records.length > 0) {
        admissionsStore = records;
        return records;
      }
    } catch (err) {
      console.warn('Google Sheets read failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/admissions`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      admissionsStore = data;
      return data;
    } catch (err) {
      console.warn('Backend unavailable, falling back to mock admissions:', err);
    }
  }
  await simulateLatency();
  return [...admissionsStore];
}

export async function addAdmission(admissionData: Omit<Admission, 'id'> & { id?: string }): Promise<Admission> {
  const newAdmission: Admission = {
    ...admissionData,
    id: admissionData.id || `ADM-${400 + admissionsStore.length + 1}`
  };

  if (await isGoogleSheetsEnabled()) {
    try {
      await appendSheetRecord('Admissions', newAdmission);
      admissionsStore = [newAdmission, ...admissionsStore];
      return newAdmission;
    } catch (err) {
      console.warn('Google Sheets append failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/admissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmission)
      });
      if (!response.ok) throw new Error(`Failed to admit patient: ${response.statusText}`);
      const created = await response.json();
      admissionsStore = [created, ...admissionsStore];
      return created;
    } catch (err) {
      console.warn('Backend unavailable, saving admission to mock store:', err);
    }
  }

  await simulateLatency();
  admissionsStore = [newAdmission, ...admissionsStore];

  // Auto-sync patient status to 'Inpatient'
  const patient = patientsStore.find((p) => p.id === newAdmission.patientId);
  if (patient) {
    patient.status = 'Inpatient';
  }

  return newAdmission;
}

export async function updateAdmission(id: string, updatedFields: Partial<Admission>): Promise<Admission> {
  const index = admissionsStore.findIndex((a) => a.id === id);
  const existing = index !== -1 ? admissionsStore[index] : ({} as Admission);
  const updated = { ...existing, ...updatedFields, id };

  if (await isGoogleSheetsEnabled()) {
    try {
      await updateSheetRecord('Admissions', id, updated);
      if (index !== -1) admissionsStore[index] = updated;
      return updated;
    } catch (err) {
      console.warn('Google Sheets update failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/admissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!response.ok) throw new Error(`Failed to update admission: ${response.statusText}`);
      const resData = await response.json();
      if (index !== -1) admissionsStore[index] = resData;
      return resData;
    } catch (err) {
      console.warn('Backend unavailable, updating mock admission:', err);
    }
  }

  await simulateLatency();
  if (index === -1) throw new Error(`Admission with ID ${id} not found.`);
  admissionsStore[index] = updated;

  // If discharged, sync patient status
  if (updated.status === 'Discharged') {
    const patient = patientsStore.find((p) => p.id === updated.patientId);
    if (patient) {
      patient.status = 'Discharged';
    }
  }

  return updated;
}

/**
 * =========================================================================
 * PHARMACY / MEDICINE SERVICE FUNCTIONS
 * Maps to Google Sheets 'Medicines' tab or /api/medicines
 * =========================================================================
 */
export async function getMedicines(): Promise<Medicine[]> {
  if (await isGoogleSheetsEnabled()) {
    try {
      const records = await readSheetRecords<Medicine>('Medicines');
      if (records && records.length > 0) {
        medicinesStore = records;
        return records;
      }
    } catch (err) {
      console.warn('Google Sheets read failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      medicinesStore = data;
      return data;
    } catch (err) {
      console.warn('Backend unavailable, falling back to mock medicines:', err);
    }
  }
  await simulateLatency();
  return [...medicinesStore];
}

export async function addMedicine(medicineData: Omit<Medicine, 'id'> & { id?: string }): Promise<Medicine> {
  const stockStatus =
    medicineData.quantity <= 10 ? 'Critical' : medicineData.quantity <= 25 ? 'Low Stock' : 'In Stock';

  const newMedicine: Medicine = {
    ...medicineData,
    id: medicineData.id || `MED-${500 + medicinesStore.length + 1}`,
    stockStatus: medicineData.stockStatus || stockStatus
  };

  if (await isGoogleSheetsEnabled()) {
    try {
      await appendSheetRecord('Medicines', newMedicine);
      medicinesStore = [newMedicine, ...medicinesStore];
      return newMedicine;
    } catch (err) {
      console.warn('Google Sheets append failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedicine)
      });
      if (!response.ok) throw new Error(`Failed to add medicine: ${response.statusText}`);
      const created = await response.json();
      medicinesStore = [created, ...medicinesStore];
      return created;
    } catch (err) {
      console.warn('Backend unavailable, saving medicine to mock store:', err);
    }
  }

  await simulateLatency();
  medicinesStore = [newMedicine, ...medicinesStore];
  return newMedicine;
}

export async function updateMedicine(id: string, updatedFields: Partial<Medicine>): Promise<Medicine> {
  const index = medicinesStore.findIndex((m) => m.id === id);
  const current = index !== -1 ? medicinesStore[index] : ({} as Medicine);
  const newQty = updatedFields.quantity !== undefined ? updatedFields.quantity : current.quantity;
  const computedStatus = newQty <= 10 ? 'Critical' : newQty <= 25 ? 'Low Stock' : 'In Stock';

  const updated: Medicine = {
    ...current,
    ...updatedFields,
    id,
    quantity: newQty,
    stockStatus: updatedFields.stockStatus || computedStatus
  };

  if (await isGoogleSheetsEnabled()) {
    try {
      await updateSheetRecord('Medicines', id, updated);
      if (index !== -1) medicinesStore[index] = updated;
      return updated;
    } catch (err) {
      console.warn('Google Sheets update failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!response.ok) throw new Error(`Failed to update medicine: ${response.statusText}`);
      const resData = await response.json();
      if (index !== -1) medicinesStore[index] = resData;
      return resData;
    } catch (err) {
      console.warn('Backend unavailable, updating mock medicine:', err);
    }
  }

  await simulateLatency();
  if (index === -1) throw new Error(`Medicine with ID ${id} not found.`);
  medicinesStore[index] = updated;
  return updated;
}

export async function deleteMedicine(id: string): Promise<{ success: boolean; id: string }> {
  if (await isGoogleSheetsEnabled()) {
    try {
      await deleteSheetRecord('Medicines', id);
      medicinesStore = medicinesStore.filter((m) => m.id !== id);
      return { success: true, id };
    } catch (err) {
      console.warn('Google Sheets delete failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`Failed to delete medicine: ${response.statusText}`);
      medicinesStore = medicinesStore.filter((m) => m.id !== id);
      return await response.json();
    } catch (err) {
      console.warn('Backend unavailable, deleting from mock medicine store:', err);
    }
  }

  await simulateLatency();
  medicinesStore = medicinesStore.filter((m) => m.id !== id);
  return { success: true, id };
}

/**
 * =========================================================================
 * BILLING SERVICE FUNCTIONS
 * Maps to Google Sheets 'Bills' tab or /api/bills
 * =========================================================================
 */
export async function getBills(): Promise<Bill[]> {
  if (await isGoogleSheetsEnabled()) {
    try {
      const records = await readSheetRecords<Bill>('Bills');
      if (records && records.length > 0) {
        billsStore = records;
        return records;
      }
    } catch (err) {
      console.warn('Google Sheets read failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/bills`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      billsStore = data;
      return data;
    } catch (err) {
      console.warn('Backend unavailable, falling back to mock bills:', err);
    }
  }
  await simulateLatency();
  return [...billsStore];
}

export async function addBill(billData: Omit<Bill, 'id' | 'totalAmount'> & { id?: string; totalAmount?: number }): Promise<Bill> {
  const calculatedTotal =
    (billData.consultationFee || 0) +
    (billData.medicineCharges || 0) +
    (billData.roomCharges || 0) +
    (billData.otherCharges || 0);

  const newBill: Bill = {
    ...billData,
    id: billData.id || `INV-${8000 + billsStore.length + 1}`,
    totalAmount: billData.totalAmount !== undefined ? billData.totalAmount : calculatedTotal
  };

  if (await isGoogleSheetsEnabled()) {
    try {
      await appendSheetRecord('Bills', newBill);
      billsStore = [newBill, ...billsStore];
      return newBill;
    } catch (err) {
      console.warn('Google Sheets append failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBill)
      });
      if (!response.ok) throw new Error(`Failed to generate bill: ${response.statusText}`);
      const created = await response.json();
      billsStore = [created, ...billsStore];
      return created;
    } catch (err) {
      console.warn('Backend unavailable, saving bill to mock store:', err);
    }
  }

  await simulateLatency();
  billsStore = [newBill, ...billsStore];
  return newBill;
}

export async function updateBill(id: string, updatedFields: Partial<Bill>): Promise<Bill> {
  const index = billsStore.findIndex((b) => b.id === id);
  const current = index !== -1 ? billsStore[index] : ({} as Bill);
  const consultationFee = updatedFields.consultationFee ?? current.consultationFee;
  const medicineCharges = updatedFields.medicineCharges ?? current.medicineCharges;
  const roomCharges = updatedFields.roomCharges ?? current.roomCharges;
  const otherCharges = updatedFields.otherCharges ?? current.otherCharges;
  const totalAmount =
    updatedFields.totalAmount ?? (consultationFee + medicineCharges + roomCharges + otherCharges);

  const updated: Bill = {
    ...current,
    ...updatedFields,
    id,
    consultationFee,
    medicineCharges,
    roomCharges,
    otherCharges,
    totalAmount
  };

  if (await isGoogleSheetsEnabled()) {
    try {
      await updateSheetRecord('Bills', id, updated);
      if (index !== -1) billsStore[index] = updated;
      return updated;
    } catch (err) {
      console.warn('Google Sheets update failed:', err);
    }
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/bills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!response.ok) throw new Error(`Failed to update bill: ${response.statusText}`);
      const resData = await response.json();
      if (index !== -1) billsStore[index] = resData;
      return resData;
    } catch (err) {
      console.warn('Backend unavailable, updating mock bill:', err);
    }
  }

  await simulateLatency();
  if (index === -1) throw new Error(`Bill with ID ${id} not found.`);
  billsStore[index] = updated;
  return updated;
}

/**
 * Reset all stores to initial mock data (useful for demo presentations)
 */
export function resetMockDatabase(): void {
  patientsStore = [...initialPatients];
  doctorsStore = [...initialDoctors];
  appointmentsStore = [...initialAppointments];
  admissionsStore = [...initialAdmissions];
  medicinesStore = [...initialMedicines];
  billsStore = [...initialBills];
}

/**
 * Returns current API configuration and environment status
 */
export function getApiConfig() {
  const url = getActiveApiUrl();
  const sheetsId = getConnectedSpreadsheetId();
  return {
    isGoogleSheets: Boolean(sheetsId),
    googleSheetsId: sheetsId,
    isLiveBackend: Boolean(url),
    baseUrl: sheetsId
      ? 'Google Sheets Cloud Database'
      : url || 'Mock In-Memory REST Simulation Mode',
    targetWorkbook: 'hospital_database.xlsx',
    sheets: ['Patients', 'Doctors', 'Appointments', 'Admissions', 'Medicines', 'Bills']
  };
}

/**
 * Utility to download a CSV snapshot of any sheet for Excel verification
 */
export function exportSheetAsCSV(sheetName: 'Patients' | 'Doctors' | 'Appointments' | 'Admissions' | 'Medicines' | 'Bills') {
  let headers: string[] = [];
  let rows: (string | number)[][] = [];

  switch (sheetName) {
    case 'Patients':
      headers = ['Patient ID', 'Full Name', 'Age', 'Gender', 'Phone', 'Email', 'Blood Group', 'Address', 'Emergency Contact', 'Department', 'Assigned Doctor', 'Registration Date', 'Status'];
      rows = patientsStore.map((p) => [
        p.id, p.fullName, p.age, p.gender, p.phone, p.email, p.bloodGroup, `"${p.address}"`, `"${p.emergencyContact}"`, p.department, p.assignedDoctor, p.registrationDate, p.status
      ]);
      break;
    case 'Doctors':
      headers = ['Doctor ID', 'Name', 'Specialization', 'Department', 'Phone', 'Email', 'Experience', 'Availability', 'Consultation Fee', 'Status', 'Room'];
      rows = doctorsStore.map((d) => [
        d.id, d.name, d.specialization, d.department, d.phone, d.email, d.experience, d.availability, d.consultationFee, d.status, d.room
      ]);
      break;
    case 'Appointments':
      headers = ['Appointment ID', 'Patient ID', 'Patient Name', 'Doctor ID', 'Doctor Name', 'Department', 'Date', 'Time', 'Reason', 'Status'];
      rows = appointmentsStore.map((a) => [
        a.id, a.patientId, a.patientName, a.doctorId, a.doctorName, a.department, a.appointmentDate, a.appointmentTime, `"${a.reason}"`, a.status
      ]);
      break;
    case 'Admissions':
      headers = ['Admission ID', 'Patient ID', 'Patient Name', 'Room Number', 'Bed Number', 'Department', 'Doctor', 'Admission Date', 'Expected Discharge', 'Actual Discharge', 'Status'];
      rows = admissionsStore.map((ad) => [
        ad.id, ad.patientId, ad.patientName, ad.roomNumber, ad.bedNumber, ad.department, ad.doctor, ad.admissionDate, ad.expectedDischarge, ad.actualDischarge || '', ad.status
      ]);
      break;
    case 'Medicines':
      headers = ['Medicine ID', 'Name', 'Category', 'Quantity', 'Unit Price', 'Expiry Date', 'Supplier', 'Stock Status'];
      rows = medicinesStore.map((m) => [
        m.id, m.name, m.category, m.quantity, m.unitPrice, m.expiryDate, m.supplier, m.stockStatus
      ]);
      break;
    case 'Bills':
      headers = ['Bill ID', 'Patient ID', 'Patient Name', 'Consultation Fee', 'Medicine Charges', 'Room Charges', 'Other Charges', 'Total Amount', 'Payment Status', 'Billing Date'];
      rows = billsStore.map((b) => [
        b.id, b.patientId, b.patientName, b.consultationFee, b.medicineCharges, b.roomCharges, b.otherCharges, b.totalAmount, b.paymentStatus, b.billingDate
      ]);
      break;
  }

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Hospital_${sheetName}_Sheet.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
