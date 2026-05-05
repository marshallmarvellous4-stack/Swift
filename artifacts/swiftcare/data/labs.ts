export interface LabTest {
  name: string;
  price: number;
  turnaround: string;
}

export interface Lab {
  id: string;
  name: string;
  location: string;
  availableTests: LabTest[];
  openingHours: string;
  priceRange: string;
  image: string;
  contact: string;
  rating: number;
  reviews: number;
  description: string;
  isAccredited: boolean;
  createdAt: string;
}

export const LABS: Lab[] = [
  {
    id: "1",
    name: "PathCare Nigeria",
    location: "Victoria Island, Lagos",
    availableTests: [
      { name: "Malaria RDT", price: 1500, turnaround: "30 mins" },
      { name: "Full Blood Count (FBC)", price: 3500, turnaround: "2 hours" },
      { name: "Blood Sugar (Fasting)", price: 1200, turnaround: "1 hour" },
      { name: "Typhoid (Widal Test)", price: 2000, turnaround: "2 hours" },
      { name: "Pregnancy Test (urine)", price: 800, turnaround: "15 mins" },
      { name: "Genotype (Haemoglobin)", price: 2500, turnaround: "3 hours" },
      { name: "Urinalysis", price: 1500, turnaround: "1 hour" },
      { name: "HIV Screening", price: 2000, turnaround: "1 hour" },
    ],
    openingHours: "Mon – Sat: 7am – 7pm, Sun: 9am – 3pm",
    priceRange: "₦800 – ₦25,000",
    image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=400",
    contact: "+234 1 291 5000",
    rating: 4.8,
    reviews: 423,
    description: "PathCare Nigeria is one of Africa's largest diagnostic laboratory networks, offering world-class laboratory testing services with rapid turnaround times and accurate results.",
    isAccredited: true,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Clina-Lancet Laboratories",
    location: "Ikeja, Lagos",
    availableTests: [
      { name: "Malaria Blood Film", price: 2500, turnaround: "2 hours" },
      { name: "Full Blood Count (FBC)", price: 4000, turnaround: "2 hours" },
      { name: "HbA1c (Diabetes Control)", price: 6500, turnaround: "4 hours" },
      { name: "Typhoid (PCR)", price: 8500, turnaround: "24 hours" },
      { name: "Pregnancy Test (blood)", price: 2500, turnaround: "2 hours" },
      { name: "Genotype", price: 3000, turnaround: "3 hours" },
      { name: "Urinalysis + Culture", price: 5500, turnaround: "48 hours" },
      { name: "Liver Function Test", price: 6000, turnaround: "4 hours" },
    ],
    openingHours: "Mon – Fri: 7am – 6pm, Sat: 8am – 4pm",
    priceRange: "₦2,500 – ₦45,000",
    image: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=400",
    contact: "+234 1 342 5100",
    rating: 4.7,
    reviews: 287,
    description: "Clina-Lancet is a premier diagnostic laboratory offering over 3,000 different tests. Known for accuracy, reliability, and fast turnaround, they serve both walk-in patients and healthcare institutions.",
    isAccredited: true,
    createdAt: "2024-01-01",
  },
  {
    id: "3",
    name: "MedCourt Diagnostics",
    location: "Wuse 2, Abuja",
    availableTests: [
      { name: "Malaria RDT", price: 1800, turnaround: "30 mins" },
      { name: "Full Blood Count", price: 3800, turnaround: "2 hours" },
      { name: "Blood Sugar (Random)", price: 1000, turnaround: "30 mins" },
      { name: "Typhoid (Widal)", price: 2200, turnaround: "2 hours" },
      { name: "Pregnancy Test", price: 1000, turnaround: "20 mins" },
      { name: "Genotype", price: 2800, turnaround: "3 hours" },
      { name: "Urinalysis", price: 1500, turnaround: "1 hour" },
      { name: "Kidney Function Test", price: 6500, turnaround: "4 hours" },
    ],
    openingHours: "Mon – Sat: 7:30am – 6pm",
    priceRange: "₦1,000 – ₦30,000",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400",
    contact: "+234 9 461 5200",
    rating: 4.5,
    reviews: 198,
    description: "MedCourt Diagnostics provides affordable and reliable diagnostic services in Abuja. They use state-of-the-art equipment and have a team of experienced laboratory scientists.",
    isAccredited: true,
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    name: "Synlab Nigeria",
    location: "GRA, Port Harcourt",
    availableTests: [
      { name: "Malaria (PCR)", price: 12000, turnaround: "24 hours" },
      { name: "Full Blood Count", price: 4200, turnaround: "2 hours" },
      { name: "Blood Glucose (Fasting)", price: 1500, turnaround: "1 hour" },
      { name: "Typhoid (Culture)", price: 7500, turnaround: "72 hours" },
      { name: "Pregnancy (Quantitative HCG)", price: 5000, turnaround: "3 hours" },
      { name: "Haemoglobin Electrophoresis", price: 6500, turnaround: "24 hours" },
      { name: "Urinalysis", price: 2000, turnaround: "1 hour" },
      { name: "COVID-19 PCR", price: 25000, turnaround: "24 hours" },
    ],
    openingHours: "Mon – Fri: 7am – 5pm, Sat: 8am – 2pm",
    priceRange: "₦1,500 – ₦50,000",
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400",
    contact: "+234 84 231 000",
    rating: 4.9,
    reviews: 156,
    description: "Synlab is a global leader in laboratory diagnostics, operating in Nigeria with international accreditation. They provide a full range of clinical, genetic, and microbiological testing.",
    isAccredited: true,
    createdAt: "2024-01-01",
  },
  {
    id: "5",
    name: "EkoCare Diagnostics",
    location: "Apapa, Lagos",
    availableTests: [
      { name: "Malaria RDT", price: 1200, turnaround: "30 mins" },
      { name: "Full Blood Count", price: 3000, turnaround: "2 hours" },
      { name: "Blood Sugar", price: 900, turnaround: "30 mins" },
      { name: "Typhoid (Widal)", price: 1800, turnaround: "2 hours" },
      { name: "Pregnancy Test", price: 700, turnaround: "15 mins" },
      { name: "Genotype", price: 2200, turnaround: "3 hours" },
      { name: "Urinalysis", price: 1200, turnaround: "45 mins" },
      { name: "Hepatitis B Surface Antigen", price: 3500, turnaround: "2 hours" },
    ],
    openingHours: "Mon – Sat: 7am – 8pm, Sun: 10am – 4pm",
    priceRange: "₦700 – ₦20,000",
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400",
    contact: "+234 1 545 0000",
    rating: 4.4,
    reviews: 231,
    description: "EkoCare Diagnostics offers affordable, quality diagnostic services to residents of Lagos. With walk-in and appointment options and home sample collection, they make healthcare accessible.",
    isAccredited: false,
    createdAt: "2024-01-01",
  },
  {
    id: "6",
    name: "LifePoint Diagnostics",
    location: "Bodija, Ibadan",
    availableTests: [
      { name: "Malaria RDT", price: 1000, turnaround: "30 mins" },
      { name: "Full Blood Count", price: 2800, turnaround: "2 hours" },
      { name: "Blood Sugar (Fasting)", price: 800, turnaround: "1 hour" },
      { name: "Typhoid (Widal)", price: 1500, turnaround: "2 hours" },
      { name: "Pregnancy Test", price: 600, turnaround: "15 mins" },
      { name: "Genotype", price: 2000, turnaround: "3 hours" },
      { name: "Urinalysis", price: 1000, turnaround: "45 mins" },
      { name: "Stool Analysis", price: 2000, turnaround: "24 hours" },
    ],
    openingHours: "Mon – Fri: 8am – 6pm, Sat: 8am – 3pm",
    priceRange: "₦600 – ₦18,000",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400",
    contact: "+234 2 231 0000",
    rating: 4.3,
    reviews: 167,
    description: "LifePoint Diagnostics serves the Ibadan community with reliable and affordable laboratory tests. Their experienced team ensures accurate results with quick turnaround.",
    isAccredited: false,
    createdAt: "2024-01-01",
  },
];
