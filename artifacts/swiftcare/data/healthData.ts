export interface MedicalProfile {
  bloodGroup: string;
  height: string;
  weight: string;
  bmi: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyContact: { name: string; phone: string; relation: string };
  insurance: string;
}

export interface HealthRecord {
  id: string;
  type: string;
  icon: string;
  iconColor: string;
  date: string;
  facility: string;
  status: "Normal" | "Review" | "Critical";
}

export interface ConsultationSummary {
  symptoms: string;
  doctorNotes: string;
  diagnosis: string;
  prescription: string;
  labRequests: string;
  followUpDate: string;
}

export interface Consultation {
  id: string;
  doctorName: string;
  doctorPhoto: string;
  specialty: string;
  type: "Chat" | "Voice" | "Video";
  date: string;
  status: "Completed" | "Cancelled" | "Pending";
  paymentStatus: "Paid" | "Unpaid" | "Refunded";
  fee: number;
  summary: ConsultationSummary;
}

export interface Appointment {
  id: string;
  doctorName: string;
  doctorPhoto: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
}

export interface Prescription {
  id: string;
  doctorName: string;
  date: string;
  medicines: { name: string; dosage: string; duration: string }[];
  notes: string;
}

export interface LabResult {
  id: string;
  testName: string;
  category: "Blood Test" | "Urinalysis" | "Eye Test" | "COVID Test" | "Dental";
  icon: string;
  iconColor: string;
  date: string;
  lab: string;
  status: "Normal" | "Abnormal" | "Pending";
}

export interface TimelineEvent {
  id: string;
  type: "Appointment" | "Consultation" | "Prescription" | "Lab Request" | "Lab Result" | "Follow-up";
  title: string;
  subtitle: string;
  date: string;
  icon: string;
  color: string;
}

export interface PaymentRecord {
  id: string;
  description: string;
  amount: number;
  type: "Consultation" | "Lab" | "Hospital";
  status: "Paid" | "Pending" | "Refunded";
  date: string;
  reference: string;
}

export interface Notification {
  id: string;
  icon: string;
  color: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const MEDICAL_PROFILE: MedicalProfile = {
  bloodGroup: "O+",
  height: "175 cm",
  weight: "72 kg",
  bmi: "23.5",
  allergies: ["Penicillin", "Pollen", "Shellfish"],
  conditions: ["Mild Hypertension", "Seasonal Rhinitis"],
  medications: ["Lisinopril 10mg", "Cetirizine 10mg"],
  emergencyContact: { name: "Chidi Okonkwo", phone: "+234 801 234 5678", relation: "Spouse" },
  insurance: "AXA Mansard Health Plan",
};

export const HEALTH_RECORDS: HealthRecord[] = [
  { id: "hr1", type: "Blood Test", icon: "water-outline", iconColor: "#EF4444", date: "Jun 28, 2026", facility: "LUTH Diagnostic Centre", status: "Normal" },
  { id: "hr2", type: "Eye Examination", icon: "eye-outline", iconColor: "#3B82F6", date: "Jun 15, 2026", facility: "Reddington Eye Clinic", status: "Normal" },
  { id: "hr3", type: "Prescription", icon: "document-text-outline", iconColor: "#22C55E", date: "Jun 10, 2026", facility: "Dr. Amara Okafor", status: "Normal" },
  { id: "hr4", type: "Vaccination", icon: "shield-checkmark-outline", iconColor: "#A855F7", date: "May 20, 2026", facility: "National Immunization Centre", status: "Normal" },
  { id: "hr5", type: "MRI Scan", icon: "scan-outline", iconColor: "#F59E0B", date: "Apr 5, 2026", facility: "Radiance Imaging Centre", status: "Review" },
  { id: "hr6", type: "X-Ray", icon: "body-outline", iconColor: "#64748B", date: "Mar 12, 2026", facility: "St. Nicholas Hospital", status: "Normal" },
];

export const CONSULTATIONS: Consultation[] = [
  {
    id: "c1",
    doctorName: "Dr. Amara Okafor",
    doctorPhoto: "https://randomuser.me/api/portraits/women/44.jpg",
    specialty: "General Practitioner",
    type: "Video",
    date: "Jul 10, 2026",
    status: "Completed",
    paymentStatus: "Paid",
    fee: 5500,
    summary: {
      symptoms: "Persistent headache, fatigue, mild fever for 3 days",
      doctorNotes: "Patient presents with tension headache likely stress-induced. BP slightly elevated at 130/85. Advised rest and hydration. Follow-up in 2 weeks.",
      diagnosis: "Tension Headache, Mild Hypertension",
      prescription: "Paracetamol 500mg TDS, Lisinopril 10mg OD",
      labRequests: "Full Blood Count, Blood Pressure Monitoring",
      followUpDate: "Jul 24, 2026",
    },
  },
  {
    id: "c2",
    doctorName: "Dr. Fatima Al-Hassan",
    doctorPhoto: "https://randomuser.me/api/portraits/women/68.jpg",
    specialty: "Pediatrician",
    type: "Chat",
    date: "Jun 22, 2026",
    status: "Completed",
    paymentStatus: "Paid",
    fee: 7500,
    summary: {
      symptoms: "Skin rash on forearms, itching for 5 days",
      doctorNotes: "Allergic contact dermatitis. Likely triggered by new detergent or fabric. Skin is otherwise healthy.",
      diagnosis: "Allergic Contact Dermatitis",
      prescription: "Hydrocortisone cream 1% BD, Cetirizine 10mg OD",
      labRequests: "Skin Allergy Patch Test",
      followUpDate: "Jul 6, 2026",
    },
  },
  {
    id: "c3",
    doctorName: "Dr. Emmanuel Taiwo",
    doctorPhoto: "https://randomuser.me/api/portraits/men/77.jpg",
    specialty: "Psychiatrist",
    type: "Voice",
    date: "May 14, 2026",
    status: "Completed",
    paymentStatus: "Paid",
    fee: 8500,
    summary: {
      symptoms: "Anxiety, difficulty sleeping, low mood for 3 weeks",
      doctorNotes: "Mild anxiety disorder with insomnia. No evidence of major depressive disorder. Recommend CBT sessions and sleep hygiene practices.",
      diagnosis: "Generalized Anxiety Disorder (Mild)",
      prescription: "Sertraline 25mg OD (starter dose)",
      labRequests: "Thyroid Function Test",
      followUpDate: "Jun 1, 2026",
    },
  },
];

export const APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    doctorName: "Dr. Chukwuemeka Nwosu",
    doctorPhoto: "https://randomuser.me/api/portraits/men/32.jpg",
    specialty: "Cardiologist",
    hospital: "National Cardiology Centre, Abuja",
    date: "Jul 24, 2026",
    time: "10:00 AM",
    status: "Upcoming",
  },
  {
    id: "a2",
    doctorName: "Dr. Ngozi Eze",
    doctorPhoto: "https://randomuser.me/api/portraits/women/22.jpg",
    specialty: "Gynecologist",
    hospital: "Life Care Hospital, Enugu",
    date: "Aug 5, 2026",
    time: "2:30 PM",
    status: "Upcoming",
  },
  {
    id: "a3",
    doctorName: "Dr. Amara Okafor",
    doctorPhoto: "https://randomuser.me/api/portraits/women/44.jpg",
    specialty: "General Practitioner",
    hospital: "SwiftCare Virtual Clinic",
    date: "Jul 10, 2026",
    time: "9:00 AM",
    status: "Completed",
  },
  {
    id: "a4",
    doctorName: "Dr. Babatunde Adeleke",
    doctorPhoto: "https://randomuser.me/api/portraits/men/55.jpg",
    specialty: "Dermatologist",
    hospital: "Port Harcourt Skin Clinic",
    date: "Jun 30, 2026",
    time: "11:00 AM",
    status: "Cancelled",
  },
];

export const PRESCRIPTIONS: Prescription[] = [
  {
    id: "p1",
    doctorName: "Dr. Amara Okafor",
    date: "Jul 10, 2026",
    medicines: [
      { name: "Paracetamol 500mg", dosage: "3x daily", duration: "5 days" },
      { name: "Lisinopril 10mg", dosage: "Once daily", duration: "Ongoing" },
    ],
    notes: "Take Paracetamol after meals. Monitor blood pressure daily.",
  },
  {
    id: "p2",
    doctorName: "Dr. Fatima Al-Hassan",
    date: "Jun 22, 2026",
    medicines: [
      { name: "Hydrocortisone Cream 1%", dosage: "Apply twice daily", duration: "7 days" },
      { name: "Cetirizine 10mg", dosage: "Once daily", duration: "14 days" },
    ],
    notes: "Avoid known allergens. Discontinue if rash worsens.",
  },
  {
    id: "p3",
    doctorName: "Dr. Emmanuel Taiwo",
    date: "May 14, 2026",
    medicines: [
      { name: "Sertraline 25mg", dosage: "Once daily (morning)", duration: "4 weeks" },
    ],
    notes: "Do not stop abruptly. Report any unusual side effects.",
  },
];

export const LAB_RESULTS: LabResult[] = [
  { id: "l1", testName: "Full Blood Count (FBC)", category: "Blood Test", icon: "water-outline", iconColor: "#EF4444", date: "Jun 28, 2026", lab: "LUTH Diagnostics", status: "Normal" },
  { id: "l2", testName: "Blood Pressure Monitoring", category: "Blood Test", icon: "pulse-outline", iconColor: "#F59E0B", date: "Jun 28, 2026", lab: "LUTH Diagnostics", status: "Abnormal" },
  { id: "l3", testName: "Urinalysis", category: "Urinalysis", icon: "beaker-outline", iconColor: "#06B6D4", date: "Jun 28, 2026", lab: "LUTH Diagnostics", status: "Normal" },
  { id: "l4", testName: "Visual Acuity Test", category: "Eye Test", icon: "eye-outline", iconColor: "#3B82F6", date: "Jun 15, 2026", lab: "Reddington Eye Clinic", status: "Normal" },
  { id: "l5", testName: "COVID-19 PCR Test", category: "COVID Test", icon: "shield-outline", iconColor: "#A855F7", date: "Apr 10, 2026", lab: "NCDC Lab", status: "Normal" },
  { id: "l6", testName: "Dental X-Ray", category: "Dental", icon: "happy-outline", iconColor: "#64748B", date: "Mar 20, 2026", lab: "Smile Dental Clinic", status: "Normal" },
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: "t1", type: "Appointment", title: "GP Appointment", subtitle: "Dr. Amara Okafor", date: "Jul 10, 2026", icon: "calendar-outline", color: "#3B82F6" },
  { id: "t2", type: "Consultation", title: "Video Consultation", subtitle: "Headache & fatigue", date: "Jul 10, 2026", icon: "videocam-outline", color: "#22C55E" },
  { id: "t3", type: "Prescription", title: "Prescription Issued", subtitle: "Paracetamol, Lisinopril", date: "Jul 10, 2026", icon: "document-text-outline", color: "#F59E0B" },
  { id: "t4", type: "Lab Request", title: "Lab Test Requested", subtitle: "Full Blood Count", date: "Jul 11, 2026", icon: "flask-outline", color: "#A855F7" },
  { id: "t5", type: "Lab Result", title: "Lab Results Ready", subtitle: "FBC — Normal", date: "Jun 28, 2026", icon: "checkmark-circle-outline", color: "#22C55E" },
  { id: "t6", type: "Follow-up", title: "Follow-up Scheduled", subtitle: "Dr. Amara Okafor", date: "Jul 24, 2026", icon: "time-outline", color: "#06B6D4" },
];

export const PAYMENT_HISTORY: PaymentRecord[] = [
  { id: "pay1", description: "Video Consultation — Dr. Amara Okafor", amount: 5500, type: "Consultation", status: "Paid", date: "Jul 10, 2026", reference: "SC7A2FX1" },
  { id: "pay2", description: "Lab Tests — LUTH Diagnostics", amount: 12000, type: "Lab", status: "Paid", date: "Jun 28, 2026", reference: "SC3B8YZ2" },
  { id: "pay3", description: "Chat Consultation — Dr. Fatima Al-Hassan", amount: 7500, type: "Consultation", status: "Paid", date: "Jun 22, 2026", reference: "SC9C1MN3" },
  { id: "pay4", description: "Voice Consultation — Dr. Emmanuel Taiwo", amount: 8500, type: "Consultation", status: "Paid", date: "May 14, 2026", reference: "SC2D5PQ4" },
];

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", icon: "calendar-outline", color: "#3B82F6", title: "Upcoming Appointment", message: "Dr. Chukwuemeka Nwosu on Jul 24 at 10:00 AM", time: "2 hours ago", read: false },
  { id: "n2", icon: "medical-outline", color: "#22C55E", title: "Medication Reminder", message: "Take Lisinopril 10mg — Once daily", time: "5 hours ago", read: false },
  { id: "n3", icon: "flask-outline", color: "#A855F7", title: "Lab Results Ready", message: "Your Full Blood Count results are now available", time: "Yesterday", read: true },
  { id: "n4", icon: "chatbubble-outline", color: "#F59E0B", title: "Doctor Message", message: "Dr. Amara Okafor sent a follow-up note", time: "2 days ago", read: true },
];
