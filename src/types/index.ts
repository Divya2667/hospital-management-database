export type PatientStatus = 'Active' | 'Discharged' | 'Inpatient' | 'Outpatient';
export type Gender = 'Male' | 'Female' | 'Other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string;
  bloodGroup: BloodGroup;
  address: string;
  emergencyContact: string;
  department: string;
  assignedDoctor: string;
  registrationDate: string; // YYYY-MM-DD
  status: PatientStatus;
  notes?: string;
}

export type DoctorAvailability = 'Available' | 'On Call' | 'In Surgery' | 'On Leave';
export type DoctorStatus = 'Active' | 'Inactive';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  phone: string;
  email: string;
  experience: string;
  availability: DoctorAvailability;
  consultationFee: number;
  status: DoctorStatus;
  room: string;
  qualification?: string;
}

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Waiting';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "09:30 AM"
  reason: string;
  status: AppointmentStatus;
  tokenNumber?: number;
}

export type AdmissionStatus = 'Admitted' | 'Discharged' | 'Transferred';

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  roomNumber: string;
  bedNumber: string;
  department: string;
  doctor: string;
  admissionDate: string; // YYYY-MM-DD
  expectedDischarge: string; // YYYY-MM-DD
  actualDischarge: string | null;
  status: AdmissionStatus;
  wardType?: 'General' | 'ICU' | 'Semi-Private' | 'Private Deluxe';
}

export type StockStatus = 'In Stock' | 'Low Stock' | 'Critical';

export interface Medicine {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  expiryDate: string; // YYYY-MM-DD
  supplier: string;
  stockStatus: StockStatus;
  batchNumber?: string;
  dosage?: string;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  consultationFee: number;
  medicineCharges: number;
  roomCharges: number;
  otherCharges: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  billingDate: string; // YYYY-MM-DD
  paymentMethod?: 'Cash' | 'Credit Card' | 'Health Insurance' | 'UPI/Bank Transfer';
  insuranceProvider?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'urgent';
  timestamp: string;
  read: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'patients'
  | 'doctors'
  | 'appointments'
  | 'admissions'
  | 'pharmacy'
  | 'billing'
  | 'reports'
  | 'settings';
