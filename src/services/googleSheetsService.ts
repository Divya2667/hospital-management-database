import { getAccessToken } from './googleAuth';
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

const SPREADSHEET_TITLE = 'AuraCare_Hospital_Database';
const SPREADSHEET_STORAGE_KEY = 'AURACARE_GOOGLE_SHEETS_ID';

export const SHEET_SCHEMAS: Record<string, string[]> = {
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

export const getConnectedSpreadsheetId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SPREADSHEET_STORAGE_KEY);
};

export const setConnectedSpreadsheetId = (id: string | null) => {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(SPREADSHEET_STORAGE_KEY, id);
  } else {
    localStorage.removeItem(SPREADSHEET_STORAGE_KEY);
  }
};

export const getSpreadsheetUrl = (id?: string | null): string => {
  const targetId = id || getConnectedSpreadsheetId();
  return targetId ? `https://docs.google.com/spreadsheets/d/${targetId}` : '';
};

/**
 * Searches user's Google Drive for an existing spreadsheet named AuraCare_Hospital_Database
 */
export async function findExistingHospitalSpreadsheet(): Promise<{ id: string; name: string } | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const q = encodeURIComponent(
      `name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
    );
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return { id: data.files[0].id, name: data.files[0].name };
    }
    return null;
  } catch (err) {
    console.warn('Error searching Google Drive:', err);
    return null;
  }
}

/**
 * Creates a brand new Google Spreadsheet in the user's Google Drive with all 6 worksheets
 * pre-populated with headers and initial demo records.
 */
export async function createHospitalSpreadsheet(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('You must be signed in with Google to create a spreadsheet.');

  // Step 1: Create Spreadsheet with 6 sheets and frozen header row
  const sheetsConfig = Object.keys(SHEET_SCHEMAS).map((title) => ({
    properties: {
      title,
      gridProperties: {
        frozenRowCount: 1
      }
    }
  }));

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title: SPREADSHEET_TITLE },
      sheets: sheetsConfig
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Spreadsheet: ${errText}`);
  }

  const spreadsheetData = await createRes.json();
  const spreadsheetId = spreadsheetData.spreadsheetId;

  // Step 2: Populate headers and initial seed data for all 6 sheets
  const seedDataMap: Record<string, any[]> = {
    Patients: initialPatients,
    Doctors: initialDoctors,
    Appointments: initialAppointments,
    Admissions: initialAdmissions,
    Medicines: initialMedicines,
    Bills: initialBills
  };

  const dataPayload: any[] = [];

  for (const [sheetName, headers] of Object.entries(SHEET_SCHEMAS)) {
    const rows = [headers];
    const items = seedDataMap[sheetName] || [];

    for (const item of items) {
      const rowValues = headers.map((h) => {
        const val = item[h];
        return val === undefined || val === null ? '' : val;
      });
      rows.push(rowValues);
    }

    dataPayload.push({
      range: `'${sheetName}'!A1`,
      values: rows
    });
  }

  // Batch update values
  const batchRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: dataPayload
      })
    }
  );

  if (!batchRes.ok) {
    console.warn('Batch update values warning:', await batchRes.text());
  }

  setConnectedSpreadsheetId(spreadsheetId);
  return spreadsheetId;
}

/**
 * Initializes or connects to the Google Sheets database.
 */
export async function initializeGoogleSheetsDatabase(): Promise<{ spreadsheetId: string; created: boolean }> {
  const existingId = getConnectedSpreadsheetId();
  const token = await getAccessToken();

  if (existingId && token) {
    // Verify file still exists and is accessible
    try {
      const checkRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${existingId}?fields=spreadsheetId`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (checkRes.ok) {
        return { spreadsheetId: existingId, created: false };
      }
    } catch {
      // If inaccessible, fall through to search/create
    }
  }

  // Search drive for existing file
  const found = await findExistingHospitalSpreadsheet();
  if (found) {
    setConnectedSpreadsheetId(found.id);
    return { spreadsheetId: found.id, created: false };
  }

  // Otherwise create new one
  const newId = await createHospitalSpreadsheet();
  return { spreadsheetId: newId, created: true };
}

/**
 * Generic Sheet Reader: Reads rows from a worksheet tab and converts them to typed dictionaries.
 */
export async function readSheetRecords<T>(sheetName: string): Promise<T[]> {
  const spreadsheetId = getConnectedSpreadsheetId();
  const token = await getAccessToken();
  if (!spreadsheetId || !token) return [];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:Z500`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) {
    console.warn(`Failed to read sheet ${sheetName}: ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  const values = data.values;
  if (!values || values.length <= 1) return [];

  const headers: string[] = values[0];
  const records: T[] = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row || row.length === 0 || !row[0]) continue;

    const record: any = {};
    headers.forEach((h, idx) => {
      let val = row[idx] !== undefined ? row[idx] : '';
      // Attempt numeric conversion for age, quantity, consultationFee, totalAmount
      if (['age', 'quantity', 'tokenNumber'].includes(h) && val !== '') {
        const parsed = parseInt(val, 10);
        val = isNaN(parsed) ? val : parsed;
      } else if (['unitPrice', 'consultationFee', 'medicineCharges', 'roomCharges', 'otherCharges', 'totalAmount'].includes(h) && val !== '') {
        const parsed = parseFloat(val);
        val = isNaN(parsed) ? val : parsed;
      }
      record[h] = val;
    });
    records.push(record as T);
  }

  return records;
}

/**
 * Generic Sheet Row Appender: Appends a row to a worksheet tab in Google Sheets.
 */
export async function appendSheetRecord(sheetName: string, record: Record<string, any>): Promise<void> {
  const spreadsheetId = getConnectedSpreadsheetId();
  const token = await getAccessToken();
  if (!spreadsheetId || !token) return;

  const headers = SHEET_SCHEMAS[sheetName];
  if (!headers) throw new Error(`Unknown sheet: ${sheetName}`);

  const rowValues = headers.map((h) => (record[h] !== undefined && record[h] !== null ? record[h] : ''));

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:Z:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [rowValues]
      })
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to append to Google Sheet: ${errText}`);
  }
}

/**
 * Generic Sheet Row Updater: Finds row matching ID in column A and updates its values.
 */
export async function updateSheetRecord(sheetName: string, recordId: string, updatedRecord: Record<string, any>): Promise<void> {
  const spreadsheetId = getConnectedSpreadsheetId();
  const token = await getAccessToken();
  if (!spreadsheetId || !token) return;

  // Step 1: Read all rows to find row index (1-based)
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:A`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) throw new Error(`Failed to locate row in ${sheetName}`);
  const data = await res.json();
  const colValues = data.values || [];

  let targetRowIndex = -1;
  for (let i = 0; i < colValues.length; i++) {
    if (colValues[i] && colValues[i][0] === recordId) {
      targetRowIndex = i + 1; // Google Sheets row numbers are 1-based
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error(`Record with ID ${recordId} not found in ${sheetName}`);
  }

  // Step 2: Prepare updated row values according to schema
  const headers = SHEET_SCHEMAS[sheetName];
  const rowValues = headers.map((h) =>
    updatedRecord[h] !== undefined && updatedRecord[h] !== null ? updatedRecord[h] : ''
  );

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A${targetRowIndex}:Z${targetRowIndex}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [rowValues]
      })
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Failed to update row in Google Sheet: ${errText}`);
  }
}

/**
 * Generic Sheet Row Deleter: Finds sheet numeric ID and deletes the row dimension via batchUpdate.
 */
export async function deleteSheetRecord(sheetName: string, recordId: string): Promise<void> {
  const spreadsheetId = getConnectedSpreadsheetId();
  const token = await getAccessToken();
  if (!spreadsheetId || !token) return;

  // Step 1: Fetch spreadsheet metadata to get sheetId numeric identifier
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!metaRes.ok) throw new Error('Failed to retrieve Google Sheet metadata.');
  const metaData = await metaRes.json();
  const sheetMeta = metaData.sheets?.find((s: any) => s.properties?.title === sheetName);
  if (!sheetMeta) throw new Error(`Worksheet ${sheetName} not found.`);
  const numericSheetId = sheetMeta.properties.sheetId;

  // Step 2: Locate row index
  const colRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:A`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!colRes.ok) throw new Error(`Failed to locate column A in ${sheetName}`);
  const colData = await colRes.json();
  const colValues = colData.values || [];

  let zeroBasedRowIndex = -1;
  for (let i = 0; i < colValues.length; i++) {
    if (colValues[i] && colValues[i][0] === recordId) {
      zeroBasedRowIndex = i; // 0-based index for deleteDimension
      break;
    }
  }

  if (zeroBasedRowIndex === -1) {
    throw new Error(`Record with ID ${recordId} not found in ${sheetName}`);
  }

  // Step 3: Delete row using batchUpdate
  const deleteRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: numericSheetId,
                dimension: 'ROWS',
                startIndex: zeroBasedRowIndex,
                endIndex: zeroBasedRowIndex + 1
              }
            }
          }
        ]
      })
    }
  );

  if (!deleteRes.ok) {
    const errText = await deleteRes.text();
    throw new Error(`Failed to delete row in Google Sheet: ${errText}`);
  }
}
