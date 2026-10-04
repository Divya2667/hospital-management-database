import React, { useState, useEffect } from 'react';
import {
  Patient,
  Doctor,
  Appointment,
  Admission,
  Medicine,
  Bill,
  NotificationItem,
  ToastMessage,
  ActiveTab,
  DoctorAvailability,
  AppointmentStatus
} from './types';
import {
  getPatients,
  addPatient,
  updatePatient,
  deletePatient,
  getDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getAppointments,
  addAppointment,
  updateAppointment,
  cancelAppointment,
  getAdmissions,
  addAdmission,
  updateAdmission,
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getBills,
  addBill,
  updateBill,
  exportSheetAsCSV
} from './services/api';
import { initialNotifications } from './data/mockData';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken
} from './services/googleAuth';
import { User } from 'firebase/auth';
import {
  initializeGoogleSheetsDatabase,
  getConnectedSpreadsheetId,
  getSpreadsheetUrl,
  createHospitalSpreadsheet
} from './services/googleSheetsService';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { ToastContainer } from './components/common/Toast';
import { ConfirmationModal } from './components/common/ConfirmationModal';

// Modals
import { PatientModal } from './components/modals/PatientModal';
import { PatientDetailsModal } from './components/modals/PatientDetailsModal';
import { DoctorModal } from './components/modals/DoctorModal';
import { AppointmentModal } from './components/modals/AppointmentModal';
import { AdmissionModal } from './components/modals/AdmissionModal';
import { MedicineModal } from './components/modals/MedicineModal';
import { BillModal } from './components/modals/BillModal';
import { InvoiceModal } from './components/modals/InvoiceModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { PharmacyPage } from './pages/PharmacyPage';
import { BillingPage } from './pages/BillingPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  // Navigation & Layout State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Primary Data Entities
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // System Feedback State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Google Sheets Cloud Database & OAuth State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGoogleSheetsConnected, setIsGoogleSheetsConnected] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal Visibility States
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState(false);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<Patient | null>(null);

  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [preselectedPatientForAppointment, setPreselectedPatientForAppointment] = useState<Patient | null>(null);

  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [admissionToEdit, setAdmissionToEdit] = useState<Admission | null>(null);
  const [preselectedPatientForAdmission, setPreselectedPatientForAdmission] = useState<Patient | null>(null);

  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState<Medicine | null>(null);

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billToEdit, setBillToEdit] = useState<Bill | null>(null);
  const [preselectedPatientForBill, setPreselectedPatientForBill] = useState<Patient | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState<Bill | null>(null);

  // Reusable Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Helper: Display Toast
  const addToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Load from API Service
  const loadDatabase = async () => {
    setIsLoading(true);
    try {
      const [pts, docs, apts, adms, meds, bls] = await Promise.all([
        getPatients(),
        getDoctors(),
        getAppointments(),
        getAdmissions(),
        getMedicines(),
        getBills()
      ]);
      setPatients(pts);
      setDoctors(docs);
      setAppointments(apts);
      setAdmissions(adms);
      setMedicines(meds);
      setBills(bls);
    } catch (err: any) {
      addToast('error', 'Failed to load hospital database records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();

    const savedId = getConnectedSpreadsheetId();
    if (savedId) {
      setSpreadsheetUrl(getSpreadsheetUrl(savedId));
    }

    const unsubscribe = initAuth(
      async (user) => {
        setGoogleUser(user);
        try {
          const { spreadsheetId } = await initializeGoogleSheetsDatabase();
          setIsGoogleSheetsConnected(true);
          setSpreadsheetUrl(getSpreadsheetUrl(spreadsheetId));
          await loadDatabase();
        } catch (err) {
          console.warn('Auto-init Google Sheets error:', err);
        }
      },
      () => {
        setGoogleUser(null);
        setIsGoogleSheetsConnected(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Multi-session background sync & tab visibility trigger
  useEffect(() => {
    if (!isGoogleSheetsConnected) return;

    const interval = setInterval(async () => {
      try {
        const token = await getAccessToken();
        if (token && getConnectedSpreadsheetId()) {
          const [pts, docs, apts, adms, meds, bls] = await Promise.all([
            getPatients(),
            getDoctors(),
            getAppointments(),
            getAdmissions(),
            getMedicines(),
            getBills()
          ]);
          setPatients(pts);
          setDoctors(docs);
          setAppointments(apts);
          setAdmissions(adms);
          setMedicines(meds);
          setBills(bls);
        }
      } catch (err) {
        console.debug('Background poll error:', err);
      }
    }, 25000);

    const handleVisibility = async () => {
      if (document.visibilityState === 'visible') {
        const token = await getAccessToken();
        if (token && getConnectedSpreadsheetId()) {
          loadDatabase();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isGoogleSheetsConnected]);

  // Google Sheets & OAuth Action Handlers
  const handleGoogleSignIn = async () => {
    try {
      setIsSyncing(true);
      addToast('info', 'Connecting to Google OAuth & Drive...', 'Authenticating');
      const authResult = await googleSignIn();
      if (authResult?.user) {
        setGoogleUser(authResult.user);
        addToast('info', 'Initializing AuraCare Hospital Database in Google Sheets...', 'Cloud Database');
        const { spreadsheetId, created } = await initializeGoogleSheetsDatabase();
        setIsGoogleSheetsConnected(true);
        setSpreadsheetUrl(getSpreadsheetUrl(spreadsheetId));
        await loadDatabase();
        addToast(
          'success',
          created
            ? 'Created new AuraCare Hospital Database in Google Drive with 6 tables!'
            : 'Connected to existing AuraCare Hospital Database in Google Drive!',
          'Google Sheets Ready'
        );
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      addToast('error', err.message || 'Google authentication failed', 'Connection Error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      setIsGoogleSheetsConnected(false);
      addToast('info', 'Signed out from Google. Switched back to local database.', 'Signed Out');
    } catch (err) {
      addToast('error', 'Error signing out from Google');
    }
  };

  const handleSyncGoogleSheets = async () => {
    setIsSyncing(true);
    try {
      await loadDatabase();
      addToast('success', 'Synchronized all 6 tables with Google Sheets in real-time!', 'Sync Complete');
    } catch (err) {
      addToast('error', 'Failed to synchronize with Google Sheets', 'Sync Failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleInitOrResetGoogleSheets = async () => {
    try {
      setIsSyncing(true);
      addToast('info', 'Setting up fresh AuraCare Hospital Database in Google Drive...', 'Initializing');
      const newId = await createHospitalSpreadsheet();
      setIsGoogleSheetsConnected(true);
      setSpreadsheetUrl(getSpreadsheetUrl(newId));
      await loadDatabase();
      addToast('success', 'Google Spreadsheet re-created and populated with seed tables!', 'Database Ready');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to initialize spreadsheet');
    } finally {
      setIsSyncing(false);
    }
  };

  // Quick Action Handler from TopNavbar
  const handleOpenQuickAction = (action: 'patient' | 'appointment' | 'admission' | 'bill') => {
    if (action === 'patient') {
      setPatientToEdit(null);
      setIsPatientModalOpen(true);
    } else if (action === 'appointment') {
      setAppointmentToEdit(null);
      setPreselectedPatientForAppointment(null);
      setIsAppointmentModalOpen(true);
    } else if (action === 'admission') {
      setAdmissionToEdit(null);
      setPreselectedPatientForAdmission(null);
      setIsAdmissionModalOpen(true);
    } else if (action === 'bill') {
      setBillToEdit(null);
      setPreselectedPatientForBill(null);
      setIsBillModalOpen(true);
    }
  };

  // -------------------------------------------------------------
  // PATIENT CRUD HANDLERS
  // -------------------------------------------------------------
  const handleSavePatient = async (patientData: Omit<Patient, 'id'> & { id?: string }) => {
    try {
      if (patientData.id) {
        const updated = await updatePatient(patientData.id, patientData);
        setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        addToast('success', `Updated records for ${updated.fullName} (${updated.id})`, 'Record Updated');
      } else {
        const created = await addPatient(patientData);
        setPatients((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
        addToast('success', 'Patient added successfully.', 'Patient Registered');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error saving patient to database', 'Save Failed');
      throw err;
    }
  };

  const handleDeletePatient = (patient: Patient) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Patient Record',
      message: `Are you sure you want to permanently delete patient ${patient.fullName} (${patient.id}) from the Patients Excel sheet? This action cannot be reversed.`,
      confirmLabel: 'Delete Patient',
      onConfirm: async () => {
        try {
          await deletePatient(patient.id);
          setPatients((prev) => prev.filter((p) => p.id !== patient.id));
          addToast('info', `Removed patient ${patient.fullName} from registry`, 'Record Deleted');
        } catch (err: any) {
          addToast('error', 'Failed to remove patient record');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // -------------------------------------------------------------
  // DOCTOR CRUD HANDLERS
  // -------------------------------------------------------------
  const handleSaveDoctor = async (doctorData: Omit<Doctor, 'id'> & { id?: string }) => {
    try {
      if (doctorData.id) {
        const updated = await updateDoctor(doctorData.id, doctorData);
        setDoctors((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        addToast('success', `Physician ${updated.name} updated successfully`, 'Doctor Updated');
      } else {
        const created = await addDoctor(doctorData);
        setDoctors((prev) => [created, ...prev]);
        addToast('success', `Doctor ${created.name} added to staff roster`, 'Physician Registered');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error saving doctor details');
    }
  };

  const handleDeleteDoctor = (doctor: Doctor) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Medical Staff',
      message: `Are you sure you want to remove ${doctor.name} (${doctor.id}) from active duty staff?`,
      confirmLabel: 'Remove Doctor',
      onConfirm: async () => {
        try {
          await deleteDoctor(doctor.id);
          setDoctors((prev) => prev.filter((d) => d.id !== doctor.id));
          addToast('info', `Removed ${doctor.name} from doctors roster`, 'Staff Removed');
        } catch (err: any) {
          addToast('error', 'Failed to remove doctor');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleUpdateDoctorAvailability = async (doctor: Doctor, availability: DoctorAvailability) => {
    try {
      const updated = await updateDoctor(doctor.id, { availability });
      setDoctors((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      addToast('info', `${doctor.name} status updated to ${availability}`);
    } catch (err) {
      addToast('error', 'Failed to update physician status');
    }
  };

  // -------------------------------------------------------------
  // APPOINTMENT CRUD HANDLERS
  // -------------------------------------------------------------
  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'> & { id?: string }) => {
    try {
      if (appointmentData.id) {
        const updated = await updateAppointment(appointmentData.id, appointmentData);
        setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        addToast('success', `Appointment ${updated.id} updated successfully`, 'Booking Updated');
      } else {
        const created = await addAppointment(appointmentData);
        setAppointments((prev) => [created, ...prev]);
        addToast('success', `Consultation booked for ${created.patientName} with ${created.doctorName}`, 'Appointment Confirmed');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Failed to book appointment');
    }
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Consultation',
      message: `Cancel appointment ${appointment.id} for ${appointment.patientName} on ${appointment.appointmentDate}?`,
      confirmLabel: 'Cancel Booking',
      onConfirm: async () => {
        try {
          const updated = await cancelAppointment(appointment.id);
          setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
          addToast('warning', `Appointment ${appointment.id} has been cancelled`, 'Booking Cancelled');
        } catch (err: any) {
          addToast('error', 'Failed to cancel appointment');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleUpdateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    try {
      const updated = await updateAppointment(id, { status });
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      addToast('success', `Appointment marked as ${status}`);
    } catch (err) {
      addToast('error', 'Failed to update appointment status');
    }
  };

  // -------------------------------------------------------------
  // ADMISSION CRUD HANDLERS
  // -------------------------------------------------------------
  const handleSaveAdmission = async (admissionData: Omit<Admission, 'id'> & { id?: string }) => {
    try {
      if (admissionData.id) {
        const updated = await updateAdmission(admissionData.id, admissionData);
        setAdmissions((prev) => prev.map((ad) => (ad.id === updated.id ? updated : ad)));
        addToast('success', `Inpatient admission ${updated.id} updated`, 'Admission Updated');
      } else {
        const created = await addAdmission(admissionData);
        setAdmissions((prev) => [created, ...prev]);
        // Also reflect patient status to 'Inpatient' in UI
        setPatients((prev) =>
          prev.map((p) => (p.id === created.patientId ? { ...p, status: 'Inpatient' } : p))
        );
        addToast('success', `Admitted ${created.patientName} to Room ${created.roomNumber} (Bed ${created.bedNumber})`, 'Inpatient Admitted');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Failed to register admission');
    }
  };

  const handleDischargePatient = (admission: Admission) => {
    const today = new Date().toISOString().split('T')[0];
    setConfirmDialog({
      isOpen: true,
      title: 'Discharge Patient & Free Bed',
      message: `Confirm clinical discharge of ${admission.patientName} from Room ${admission.roomNumber}, Bed ${admission.bedNumber}? This will mark the bed as sanitized and available.`,
      confirmLabel: 'Confirm Discharge',
      onConfirm: async () => {
        try {
          const updated = await updateAdmission(admission.id, {
            status: 'Discharged',
            actualDischarge: today
          });
          setAdmissions((prev) => prev.map((ad) => (ad.id === updated.id ? updated : ad)));
          // Reflect patient status to 'Discharged'
          setPatients((prev) =>
            prev.map((p) => (p.id === updated.patientId ? { ...p, status: 'Discharged' } : p))
          );
          addToast('success', `${admission.patientName} successfully discharged from ward`, 'Patient Discharged');
        } catch (err: any) {
          addToast('error', 'Failed to discharge patient');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // -------------------------------------------------------------
  // PHARMACY / MEDICINE CRUD HANDLERS
  // -------------------------------------------------------------
  const handleSaveMedicine = async (medicineData: Omit<Medicine, 'id'> & { id?: string }) => {
    try {
      if (medicineData.id) {
        const updated = await updateMedicine(medicineData.id, medicineData);
        setMedicines((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        addToast('success', `Pharmaceutical formulation ${updated.name} updated`, 'Inventory Updated');
      } else {
        const created = await addMedicine(medicineData);
        setMedicines((prev) => [created, ...prev]);
        addToast('success', `Added ${created.name} (${created.quantity} units) to pharmacy`, 'Medicine Added');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Failed to save medicine');
    }
  };

  const handleDeleteMedicine = (medicine: Medicine) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Formulation SKU',
      message: `Permanently delete ${medicine.name} (${medicine.id}) from pharmacy inventory?`,
      confirmLabel: 'Delete SKU',
      onConfirm: async () => {
        try {
          await deleteMedicine(medicine.id);
          setMedicines((prev) => prev.filter((m) => m.id !== medicine.id));
          addToast('info', `Removed ${medicine.name} from inventory`, 'SKU Deleted');
        } catch (err) {
          addToast('error', 'Failed to delete medicine');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleQuickRestock = async (medicine: Medicine, units: number) => {
    try {
      const updated = await updateMedicine(medicine.id, { quantity: medicine.quantity + units });
      setMedicines((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      addToast('success', `Restocked +${units} units of ${medicine.name}. New total: ${updated.quantity} units`, 'Stock Replenished');
    } catch (err) {
      addToast('error', 'Failed to restock formulation');
    }
  };

  // -------------------------------------------------------------
  // BILLING CRUD HANDLERS
  // -------------------------------------------------------------
  const handleSaveBill = async (billData: Omit<Bill, 'id' | 'totalAmount'> & { id?: string; totalAmount?: number }) => {
    try {
      if (billData.id) {
        const updated = await updateBill(billData.id, billData);
        setBills((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        addToast('success', `Invoice ${updated.id} for ${updated.patientName} updated`, 'Bill Updated');
      } else {
        const created = await addBill(billData);
        setBills((prev) => [created, ...prev]);
        addToast('success', `Generated invoice ${created.id} for ${created.patientName} ($${created.totalAmount})`, 'Invoice Issued');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Failed to generate bill');
    }
  };

  const handleMarkBillPaid = async (bill: Bill) => {
    try {
      const updated = await updateBill(bill.id, { paymentStatus: 'Paid' });
      setBills((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      addToast('success', `Invoice ${bill.id} settled and marked as Paid`, 'Payment Recorded');
    } catch (err) {
      addToast('error', 'Failed to mark bill as paid');
    }
  };

  // Counts for Sidebar Badges
  const counts = {
    patients: patients.length,
    appointmentsToday: appointments.filter((a) => a.appointmentDate === '2026-10-04').length,
    admissions: admissions.filter((ad) => ad.status === 'Admitted').length,
    lowStockMedicines: medicines.filter((m) => m.quantity <= 25).length,
    pendingBills: bills.filter((b) => b.paymentStatus === 'Pending' || b.paymentStatus === 'Overdue').length
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        counts={counts}
      />

      {/* Top Navbar */}
      <TopNavbar
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenQuickAction={handleOpenQuickAction}
        notifications={notifications}
        onMarkNotificationAsRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        }}
        onMarkAllNotificationsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          addToast('info', 'All hospital notices marked as read');
        }}
        globalSearchQuery={globalSearchQuery}
        setGlobalSearchQuery={setGlobalSearchQuery}
        setActiveTab={setActiveTab}
        googleUser={googleUser}
        isGoogleSheetsConnected={isGoogleSheetsConnected}
        spreadsheetUrl={spreadsheetUrl}
        isSyncing={isSyncing}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onSyncGoogleSheets={handleSyncGoogleSheets}
      />

      {/* Main Content Viewport */}
      <main
        className={`pt-20 pb-12 px-6 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-600">
                Loading AuraCare Hospital Database...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardPage
                  patients={patients}
                  doctors={doctors}
                  appointments={appointments}
                  admissions={admissions}
                  bills={bills}
                  setActiveTab={setActiveTab}
                  onOpenQuickAction={handleOpenQuickAction}
                  onViewPatientDetails={(p) => {
                    setSelectedPatientForDetails(p);
                    setIsPatientDetailsOpen(true);
                  }}
                  onExportWorkbook={() => exportSheetAsCSV('Patients')}
                />
              )}

              {activeTab === 'patients' && (
                <PatientsPage
                  patients={patients}
                  onOpenAddModal={() => {
                    setPatientToEdit(null);
                    setIsPatientModalOpen(true);
                  }}
                  onEditPatient={(patient) => {
                    setPatientToEdit(patient);
                    setIsPatientModalOpen(true);
                  }}
                  onViewPatientDetails={(patient) => {
                    setSelectedPatientForDetails(patient);
                    setIsPatientDetailsOpen(true);
                  }}
                  onDeletePatientPrompt={handleDeletePatient}
                  onExportCSV={() => exportSheetAsCSV('Patients')}
                />
              )}

              {activeTab === 'doctors' && (
                <DoctorsPage
                  doctors={doctors}
                  onOpenAddModal={() => {
                    setDoctorToEdit(null);
                    setIsDoctorModalOpen(true);
                  }}
                  onEditDoctor={(doc) => {
                    setDoctorToEdit(doc);
                    setIsDoctorModalOpen(true);
                  }}
                  onDeleteDoctorPrompt={handleDeleteDoctor}
                  onUpdateDoctorAvailability={handleUpdateDoctorAvailability}
                  onExportCSV={() => exportSheetAsCSV('Doctors')}
                />
              )}

              {activeTab === 'appointments' && (
                <AppointmentsPage
                  appointments={appointments}
                  doctors={doctors}
                  onOpenBookModal={() => {
                    setAppointmentToEdit(null);
                    setPreselectedPatientForAppointment(null);
                    setIsAppointmentModalOpen(true);
                  }}
                  onEditAppointment={(apt) => {
                    setAppointmentToEdit(apt);
                    setIsAppointmentModalOpen(true);
                  }}
                  onCancelAppointmentPrompt={handleCancelAppointment}
                  onUpdateStatus={handleUpdateAppointmentStatus}
                  onExportCSV={() => exportSheetAsCSV('Appointments')}
                />
              )}

              {activeTab === 'admissions' && (
                <AdmissionsPage
                  admissions={admissions}
                  onOpenAddModal={() => {
                    setAdmissionToEdit(null);
                    setPreselectedPatientForAdmission(null);
                    setIsAdmissionModalOpen(true);
                  }}
                  onEditAdmission={(ad) => {
                    setAdmissionToEdit(ad);
                    setIsAdmissionModalOpen(true);
                  }}
                  onDischargePatient={handleDischargePatient}
                  onExportCSV={() => exportSheetAsCSV('Admissions')}
                />
              )}

              {activeTab === 'pharmacy' && (
                <PharmacyPage
                  medicines={medicines}
                  onOpenAddModal={() => {
                    setMedicineToEdit(null);
                    setIsMedicineModalOpen(true);
                  }}
                  onEditMedicine={(med) => {
                    setMedicineToEdit(med);
                    setIsMedicineModalOpen(true);
                  }}
                  onDeleteMedicinePrompt={handleDeleteMedicine}
                  onQuickRestock={handleQuickRestock}
                  onExportCSV={() => exportSheetAsCSV('Medicines')}
                />
              )}

              {activeTab === 'billing' && (
                <BillingPage
                  bills={bills}
                  onOpenAddModal={() => {
                    setBillToEdit(null);
                    setPreselectedPatientForBill(null);
                    setIsBillModalOpen(true);
                  }}
                  onEditBill={(bill) => {
                    setBillToEdit(bill);
                    setIsBillModalOpen(true);
                  }}
                  onViewInvoice={(bill) => {
                    setSelectedBillForInvoice(bill);
                    setIsInvoiceModalOpen(true);
                  }}
                  onMarkPaid={handleMarkBillPaid}
                  onExportCSV={() => exportSheetAsCSV('Bills')}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsPage
                  patients={patients}
                  doctors={doctors}
                  appointments={appointments}
                  admissions={admissions}
                  bills={bills}
                  onExportAllSheets={() => exportSheetAsCSV('Patients')}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsPage
                  onResetDatabase={() => {
                    loadDatabase();
                    addToast('info', 'Database reset to demo state');
                  }}
                  googleUser={googleUser}
                  isGoogleSheetsConnected={isGoogleSheetsConnected}
                  spreadsheetUrl={spreadsheetUrl}
                  isSyncing={isSyncing}
                  onGoogleSignIn={handleGoogleSignIn}
                  onGoogleSignOut={handleGoogleSignOut}
                  onSyncGoogleSheets={handleSyncGoogleSheets}
                  onInitGoogleSheets={handleInitOrResetGoogleSheets}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals & Dialogs */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSave={handleSavePatient}
        patientToEdit={patientToEdit}
        doctors={doctors}
      />

      <PatientDetailsModal
        isOpen={isPatientDetailsOpen}
        onClose={() => setIsPatientDetailsOpen(false)}
        patient={selectedPatientForDetails}
        appointments={appointments}
        admissions={admissions}
        bills={bills}
        onEditPatient={(p) => {
          setPatientToEdit(p);
          setIsPatientModalOpen(true);
        }}
        onBookAppointment={(p) => {
          setPreselectedPatientForAppointment(p);
          setAppointmentToEdit(null);
          setIsAppointmentModalOpen(true);
        }}
        onNewBill={(p) => {
          setPreselectedPatientForBill(p);
          setBillToEdit(null);
          setIsBillModalOpen(true);
        }}
      />

      <DoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        onSave={handleSaveDoctor}
        doctorToEdit={doctorToEdit}
      />

      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSave={handleSaveAppointment}
        appointmentToEdit={appointmentToEdit}
        patients={patients}
        doctors={doctors}
        preselectedPatient={preselectedPatientForAppointment}
      />

      <AdmissionModal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
        onSave={handleSaveAdmission}
        admissionToEdit={admissionToEdit}
        patients={patients}
        doctors={doctors}
        preselectedPatient={preselectedPatientForAdmission}
      />

      <MedicineModal
        isOpen={isMedicineModalOpen}
        onClose={() => setIsMedicineModalOpen(false)}
        onSave={handleSaveMedicine}
        medicineToEdit={medicineToEdit}
      />

      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        onSave={handleSaveBill}
        billToEdit={billToEdit}
        patients={patients}
        preselectedPatient={preselectedPatientForBill}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        bill={selectedBillForInvoice}
        patient={patients.find((p) => p.id === selectedBillForInvoice?.patientId)}
      />

      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Floating Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
