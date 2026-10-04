import React, { useState } from 'react';
import {
  Database,
  FileSpreadsheet,
  Server,
  Code2,
  CheckCircle2,
  RefreshCw,
  Download,
  Key,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { exportSheetAsCSV, resetMockDatabase, getActiveApiUrl, setActiveApiUrl } from '../services/api';
import { SHEET_SCHEMAS, getConnectedSpreadsheetId } from '../services/googleSheetsService';
import { User } from 'firebase/auth';

interface SettingsPageProps {
  onResetDatabase: () => void;
  googleUser: User | null;
  isGoogleSheetsConnected: boolean;
  spreadsheetUrl: string;
  isSyncing: boolean;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onSyncGoogleSheets: () => void;
  onInitGoogleSheets: () => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onResetDatabase,
  googleUser,
  isGoogleSheetsConnected,
  spreadsheetUrl,
  isSyncing,
  onGoogleSignIn,
  onGoogleSignOut,
  onSyncGoogleSheets,
  onInitGoogleSheets
}) => {
  const [activeTab, setActiveTab] = useState<'googlesheets' | 'architecture' | 'excel' | 'endpoints' | 'backendCode'>('googlesheets');
  const [backendUrl, setBackendUrl] = useState(getActiveApiUrl() || 'http://localhost:5000/api');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const cleanUrl = backendUrl.trim().replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/patients`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setTestResult({
          success: true,
          message: `Connected successfully! Found ${Array.isArray(data) ? data.length : 0} patient records in hospital_database.xlsx.`
        });
      } else {
        setTestResult({
          success: false,
          message: `Backend returned status ${res.status}: ${res.statusText}`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Could not connect to Flask server. Make sure "python app.py" is running on port 5000.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConnection = () => {
    const cleanUrl = backendUrl.trim().replace(/\/$/, '');
    setActiveApiUrl(cleanUrl);
    setTestResult({
      success: true,
      message: `Saved active API URL as "${cleanUrl}". Frontend will now forward all CRUD operations to this endpoint.`
    });
  };

  const handleClearConnection = () => {
    setActiveApiUrl('');
    setBackendUrl('http://localhost:5000/api');
    setTestResult({
      success: true,
      message: 'Cleared custom URL. Reverted to simulated high-fidelity mock REST mode.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              DBMS Cloud Architecture & Google Sheets Integration
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold">
              Live Cloud Database & REST Console
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Google Sheets cloud database sync, OAuth security, table schema mappings, and backend connection configs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (window.confirm('Reset local demo database back to initial sample records?')) {
                resetMockDatabase();
                onResetDatabase();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200/80 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Database</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        {[
          { id: 'googlesheets', label: '⚡ Google Sheets Cloud DB (Live)', icon: FileSpreadsheet },
          { id: 'architecture', label: '1. Relational DBMS Schema', icon: Layers },
          { id: 'excel', label: '2. Excel Sheet Mappings', icon: Database },
          { id: 'endpoints', label: '3. REST API Contracts', icon: Server },
          { id: 'backendCode', label: '4. Backend Bridge Code (Python/Flask)', icon: Code2 }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-teal-700 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: Google Sheets Cloud Database */}
      {activeTab === 'googlesheets' && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${isGoogleSheetsConnected ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-slate-900">
                      Google Sheets Live Cloud Database
                    </h3>
                    {isGoogleSheetsConnected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected & Synchronizing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        Offline Mock Fallback
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    All hospital entities (Patients, Doctors, Appointments, Admissions, Medicines, Bills) are persisted in real-time to Google Sheets in your Google Drive via Google Workspace Sheets API v4. Any add, edit, or delete action through the app instantly updates the cloud spreadsheet.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {!googleUser ? (
                  <button
                    onClick={onGoogleSignIn}
                    className="gsi-material-button shadow-xs"
                    title="Sign in with Google"
                  >
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">Connect with Google</span>
                    </div>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onSyncGoogleSheets}
                      disabled={isSyncing}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors shadow-2xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync Database Now'}</span>
                    </button>

                    {spreadsheetUrl && (
                      <a
                        href={spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Google Sheet</span>
                      </a>
                    )}

                    <button
                      onClick={onGoogleSignOut}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
                      title="Disconnect Google Account"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Connection Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  OAuth User Identity
                </span>
                {googleUser ? (
                  <div className="flex items-center gap-2.5 mt-1">
                    {googleUser.photoURL ? (
                      <img
                        src={googleUser.photoURL}
                        alt={googleUser.displayName || 'User'}
                        className="w-7 h-7 rounded-full border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                        {googleUser.displayName ? googleUser.displayName[0] : 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {googleUser.displayName || 'Authenticated User'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{googleUser.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1 italic">
                    Not authenticated. Click "Connect with Google" above.
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Cloud Spreadsheet Container
                </span>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  AuraCare_Hospital_Database
                </p>
                <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                  ID: {getConnectedSpreadsheetId() || 'Pending creation'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Real-Time Multi-Session Sync
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-800">
                    Live Polling (Every 25s & Tab Focus)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Direct mutation reflection via Sheets API v4
                </p>
              </div>
            </div>
          </div>

          {/* Database Worksheet Schema Mapping Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Google Sheets Worksheet Schema & Field Mappings
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  The spreadsheet acts as the relational database. Each entity has its own tab with frozen header rows:
                </p>
              </div>
              {isGoogleSheetsConnected && (
                <button
                  onClick={() => {
                    if (window.confirm('Re-initialize Google Spreadsheet with fresh template worksheets and sample records?')) {
                      onInitGoogleSheets();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-initialize Google Sheet</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {Object.entries(SHEET_SCHEMAS).map(([sheetName, columns]) => (
                <div key={sheetName} className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-teal-200 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      Tab: {sheetName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-semibold">
                      {columns.length} columns
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mb-2">
                    <strong>Primary Key:</strong> <code className="text-teal-700 font-bold">{columns[0]}</code>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {columns.map((col) => (
                      <span
                        key={col}
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          col === 'id'
                            ? 'bg-teal-100 text-teal-800 font-bold'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Relational DBMS Schema */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Hospital DBMS Entity-Relationship (ER) Architecture
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The system models a normalized multi-entity relational database where each entity corresponds to a dedicated sheet in the Excel workbook. Foreign keys maintain relational integrity across outpatient scheduling, inpatient bed admissions, and billing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono text-xs font-bold text-teal-800 uppercase block mb-1">
                  1. Patients (Primary Entity)
                </span>
                <p className="text-xs text-slate-600 mb-2">
                  <strong>Primary Key:</strong> <code className="text-teal-700">PatientID</code>
                </p>
                <p className="text-[11px] text-slate-500">
                  Referenced by Appointments, Admissions, and Bills as foreign keys (<code className="text-teal-700">PatientID</code>).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono text-xs font-bold text-teal-800 uppercase block mb-1">
                  2. Doctors (Clinical Staff)
                </span>
                <p className="text-xs text-slate-600 mb-2">
                  <strong>Primary Key:</strong> <code className="text-teal-700">DoctorID</code>
                </p>
                <p className="text-[11px] text-slate-500">
                  Referenced by Appointments (<code className="text-teal-700">DoctorID</code>) and assigned in Inpatient Admissions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono text-xs font-bold text-teal-800 uppercase block mb-1">
                  3. Appointments (Transaction)
                </span>
                <p className="text-xs text-slate-600 mb-2">
                  <strong>Primary Key:</strong> <code className="text-teal-700">AppointmentID</code>
                </p>
                <p className="text-[11px] text-slate-500">
                  Foreign Keys: <code className="text-teal-700">PatientID</code> &rarr; Patients, <code className="text-teal-700">DoctorID</code> &rarr; Doctors.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono text-xs font-bold text-teal-800 uppercase block mb-1">
                  4. Admissions (Ward Census)
                </span>
                <p className="text-xs text-slate-600 mb-2">
                  <strong>Primary Key:</strong> <code className="text-teal-700">AdmissionID</code>
                </p>
                <p className="text-[11px] text-slate-500">
                  Tracks bed occupancy, room numbers, and patient stay durations. FK: <code className="text-teal-700">PatientID</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono text-xs font-bold text-teal-800 uppercase block mb-1">
                  5. Medicines (Inventory)
                </span>
                <p className="text-xs text-slate-600 mb-2">
                  <strong>Primary Key:</strong> <code className="text-teal-700">MedicineID</code>
                </p>
                <p className="text-[11px] text-slate-500">
                  Tracks stock levels, unit prices, re-order thresholds, and expiration dates.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono text-xs font-bold text-teal-800 uppercase block mb-1">
                  6. Bills (Financial Ledger)
                </span>
                <p className="text-xs text-slate-600 mb-2">
                  <strong>Primary Key:</strong> <code className="text-teal-700">BillID</code>
                </p>
                <p className="text-[11px] text-slate-500">
                  Foreign Key: <code className="text-teal-700">PatientID</code>. Computes aggregate charges across doctors, ward, and medicines.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Excel Sheet Mappings */}
      {activeTab === 'excel' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Workbook: <span className="font-mono text-teal-700">Hospital_Database.xlsx</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The backend reads and writes to 6 distinct sheets in this Excel workbook.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                {
                  sheet: 'Patients' as const,
                  cols: 'Patient ID, Full Name, Age, Gender, Phone, Email, Blood Group, Address, Emergency Contact, Department, Assigned Doctor, Registration Date, Status',
                  desc: 'Stores patient demographic profiles and clinical history.'
                },
                {
                  sheet: 'Doctors' as const,
                  cols: 'Doctor ID, Name, Specialization, Department, Phone, Email, Experience, Availability, Consultation Fee, Status, Room',
                  desc: 'Roster of attending medical staff and chamber fees.'
                },
                {
                  sheet: 'Appointments' as const,
                  cols: 'Appointment ID, Patient ID, Patient Name, Doctor ID, Doctor Name, Department, Date, Time, Reason, Status',
                  desc: 'Outpatient consultation tokens and booking schedule.'
                },
                {
                  sheet: 'Admissions' as const,
                  cols: 'Admission ID, Patient ID, Patient Name, Room Number, Bed Number, Department, Doctor, Admission Date, Expected Discharge, Actual Discharge, Status',
                  desc: 'Inpatient ward bed tracking and admission lengths.'
                },
                {
                  sheet: 'Medicines' as const,
                  cols: 'Medicine ID, Name, Category, Quantity, Unit Price, Expiry Date, Supplier, Stock Status',
                  desc: 'Pharmacy SKU inventory, quantities, and re-order levels.'
                },
                {
                  sheet: 'Bills' as const,
                  cols: 'Bill ID, Patient ID, Patient Name, Consultation Fee, Medicine Charges, Room Charges, Other Charges, Total Amount, Payment Status, Billing Date',
                  desc: 'Itemized clinical receipts and settlement records.'
                }
              ].map((s) => (
                <div key={s.sheet} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold font-mono text-xs text-slate-900 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        Sheet: [{s.sheet}]
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{s.desc}</p>
                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed line-clamp-3">
                      {s.cols}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200">
                    <button
                      onClick={() => exportSheetAsCSV(s.sheet)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-white border border-teal-200 hover:bg-teal-50 rounded-lg transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Sample {s.sheet}.csv</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REST API Contracts */}
      {activeTab === 'endpoints' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                REST API Endpoint Specifications
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                The frontend service in <code className="font-mono text-teal-700">src/services/api.ts</code> consumes these standard endpoints:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Endpoint Route</th>
                    <th className="py-2.5 px-3">Target Excel Sheet</th>
                    <th className="py-2.5 px-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">GET</td>
                    <td className="py-2.5 px-3 text-slate-800">/api/patients</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Patients</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Fetch all patient rows</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-blue-700 font-bold">POST</td>
                    <td className="py-2.5 px-3 text-slate-800">/api/patients</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Patients</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Append new patient row to sheet</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-amber-700 font-bold">PUT</td>
                    <td className="py-2.5 px-3 text-slate-800">/api/patients/:id</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Patients</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Update existing patient row</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-rose-700 font-bold">DELETE</td>
                    <td className="py-2.5 px-3 text-slate-800">/api/patients/:id</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Patients</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Delete patient row</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">GET / POST</td>
                    <td className="py-2.5 px-3 text-slate-800">/api/doctors</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Doctors</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Fetch / Add doctor entries</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">GET / POST</td>
                    <td className="py-2.5 px-3 text-slate-800">/api/appointments</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Appointments</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Schedule consultations</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">GET / POST</td>
                    <td className="py-2.5 px-3 text-slate-800">/api/admissions</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Admissions</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Inpatient bed allocations</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">GET / POST</td>
                    <td className="py-2.5 px-3 text-slate-800">/api/medicines</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Medicines</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Pharmacy inventory & stock</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">GET / POST</td>
                    <td className="py-2.5 px-3 text-slate-800">/api/bills</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Bills</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Financial ledger entries</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Live Connection Tester */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Connect To Real REST Backend Server
              </h4>
              <p className="text-xs text-slate-500">
                To connect to your Python Flask or Node.js Excel backend, enter its base URL here:
              </p>
              <div className="flex flex-wrap items-center gap-2 max-w-2xl">
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="http://localhost:5000/api"
                  className="flex-1 min-w-[240px] px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                />
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  onClick={handleSaveConnection}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-2xs"
                >
                  Save & Apply URL
                </button>
                <button
                  onClick={handleClearConnection}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 rounded-xl transition-colors"
                >
                  Reset to Mock
                </button>
              </div>

              {testResult && (
                <div
                  className={`text-xs font-medium p-3 rounded-xl border ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border-rose-200'
                  }`}
                >
                  {testResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Ready-to-use Backend Code */}
      {activeTab === 'backendCode' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Backend Implementation (Python Flask + openpyxl)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                The complete backend code is located in <code className="font-mono text-teal-700 font-bold">backend/app.py</code> and uses <code className="font-mono text-teal-700">hospital_database.xlsx</code>.
              </p>
            </div>

            {/* Quick Run Steps */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                How to Run the Backend
              </h4>
              <ol className="text-xs text-slate-700 space-y-1.5 list-decimal list-inside leading-relaxed font-mono">
                <li><span className="font-sans">Navigate to the backend folder:</span> <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-teal-800">cd backend</code></li>
                <li><span className="font-sans">Install Python dependencies:</span> <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-teal-800">pip install -r requirements.txt</code></li>
                <li><span className="font-sans">Launch Flask REST API:</span> <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-teal-800">python app.py</code></li>
              </ol>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
              <div className="text-slate-400 mb-2"># backend/requirements.txt</div>
              <pre className="text-emerald-400">
{`flask>=3.0.0
flask-cors>=4.0.0
openpyxl>=3.1.2`}
              </pre>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
              <div className="text-slate-400 mb-2"># backend/app.py (Core REST Endpoints with openpyxl)</div>
              <pre className="leading-relaxed">
{`# All 6 entities have full CRUD with openpyxl:
# GET    /api/patients          GET    /api/doctors
# POST   /api/patients          POST   /api/doctors
# PUT    /api/patients/<id>     PUT    /api/doctors/<id>
# DELETE /api/patients/<id>     DELETE /api/doctors/<id>
#
# GET/POST/PUT/DELETE /api/appointments
# GET/POST/PUT/DELETE /api/admissions
# GET/POST/PUT/DELETE /api/medicines
# GET/POST/PUT/DELETE /api/bills
#
# Running on http://localhost:5000 with CORS enabled.`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
