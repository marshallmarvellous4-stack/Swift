export interface Hospital {
  id: string;
  name: string;
  location: string;
  type: "General Hospital" | "Private Clinic" | "Teaching Hospital" | "Specialist Hospital";
  services: string[];
  openingHours: string;
  image: string;
  contact: string;
  rating: number;
  reviews: number;
  description: string;
  createdAt: string;
}

export const HOSPITALS: Hospital[] = [
  {
    id: "1",
    name: "Lagos University Teaching Hospital",
    location: "Idi-Araba, Lagos",
    type: "Teaching Hospital",
    services: ["Emergency Care", "Surgery", "Cardiology", "Pediatrics", "Obstetrics", "Radiology"],
    openingHours: "24 hours, 7 days a week",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400",
    contact: "+234 1 774 0000",
    rating: 4.3,
    reviews: 512,
    description: "Lagos University Teaching Hospital (LUTH) is one of Nigeria's premier tertiary health institutions. It serves as a referral centre for complex medical cases and provides world-class training for medical students and healthcare professionals.",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Reddington Hospital",
    location: "Victoria Island, Lagos",
    type: "Private Clinic",
    services: ["General Medicine", "ICU", "Surgery", "Maternity", "Diagnostics", "Physiotherapy"],
    openingHours: "24 hours, 7 days a week",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400",
    contact: "+234 1 279 8000",
    rating: 4.7,
    reviews: 348,
    description: "Reddington Hospital is a leading private multi-specialty hospital providing international-standard healthcare services. The hospital is equipped with cutting-edge technology and staffed by highly experienced specialists.",
    createdAt: "2024-01-01",
  },
  {
    id: "3",
    name: "National Hospital Abuja",
    location: "Central Business District, Abuja",
    type: "General Hospital",
    services: ["Emergency", "Neurology", "Oncology", "Transplant Services", "Dialysis", "Mental Health"],
    openingHours: "24 hours, 7 days a week",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400",
    contact: "+234 9 523 0361",
    rating: 4.2,
    reviews: 289,
    description: "The National Hospital Abuja is a federal government tertiary health facility providing specialized medical care to Nigerians. It is equipped with modern diagnostic and treatment equipment.",
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    name: "St. Nicholas Hospital",
    location: "Lagos Island, Lagos",
    type: "Private Clinic",
    services: ["Cardiology", "Orthopedics", "Ophthalmology", "Dental", "ENT", "Pharmacy"],
    openingHours: "Mon – Sat: 8am – 8pm, Sun: 9am – 4pm",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400",
    contact: "+234 1 462 2573",
    rating: 4.5,
    reviews: 214,
    description: "St. Nicholas Hospital has been providing quality healthcare in Nigeria for decades. Known for its excellent patient care and professional medical team, it is one of the most trusted private hospitals in Lagos.",
    createdAt: "2024-01-01",
  },
  {
    id: "5",
    name: "University of Nigeria Teaching Hospital",
    location: "Ituku-Ozalla, Enugu",
    type: "Teaching Hospital",
    services: ["Burns & Plastic Surgery", "Pediatrics", "Oncology", "Radiology", "Nephrology", "HIV Clinic"],
    openingHours: "24 hours, 7 days a week",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400",
    contact: "+234 42 253 381",
    rating: 4.1,
    reviews: 176,
    description: "UNTH is a foremost tertiary health institution in Eastern Nigeria providing comprehensive health services, cutting-edge research, and training for thousands of health professionals annually.",
    createdAt: "2024-01-01",
  },
  {
    id: "6",
    name: "Medicaid Cancer Foundation",
    location: "Port Harcourt, Rivers State",
    type: "Specialist Hospital",
    services: ["Oncology", "Chemotherapy", "Radiotherapy", "Palliative Care", "Counseling", "Diagnostics"],
    openingHours: "Mon – Fri: 8am – 6pm, Sat: 9am – 2pm",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
    contact: "+234 84 462 000",
    rating: 4.6,
    reviews: 132,
    description: "Medicaid Cancer Foundation is a specialist oncology hospital dedicated to the prevention, diagnosis, and treatment of cancer in Nigeria. They offer comprehensive cancer care with compassion and expertise.",
    createdAt: "2024-01-01",
  },
];
