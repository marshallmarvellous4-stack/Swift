export interface Pharmacy {
  id: string;
  name: string;
  location: string;
  openingHours: string;
  isVerified: boolean;
  image: string;
  contact: string;
  rating: number;
  reviews: number;
  description: string;
  services: string[];
  createdAt: string;
}

export const PHARMACIES: Pharmacy[] = [
  {
    id: "1",
    name: "MedPlus Pharmacy",
    location: "Lekki Phase 1, Lagos",
    openingHours: "Mon – Sat: 8am – 9pm, Sun: 10am – 6pm",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400",
    contact: "+234 1 453 1000",
    rating: 4.7,
    reviews: 389,
    description: "MedPlus is Nigeria's leading pharmacy chain with over 100 branches nationwide. They stock a wide range of medications, supplements, and healthcare products, all sourced from verified manufacturers.",
    services: ["Prescription Dispensing", "OTC Medications", "Health Supplements", "Baby Care", "First Aid Supplies", "Blood Pressure Check"],
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "HealthPlus Pharmacy",
    location: "Garki, Abuja",
    openingHours: "Mon – Sat: 8am – 8pm, Sun: 10am – 5pm",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    contact: "+234 9 290 2000",
    rating: 4.8,
    reviews: 312,
    description: "HealthPlus is a comprehensive pharmacy and wellness retail chain. They provide pharmaceutical services, health screenings, and a wide range of wellness products for the whole family.",
    services: ["Prescription Filling", "Vaccination", "Health Screening", "Beauty & Personal Care", "Mother & Baby Products", "Diabetic Supplies"],
    createdAt: "2024-01-01",
  },
  {
    id: "3",
    name: "Drugfield Pharmaceuticals",
    location: "Owerri, Imo State",
    openingHours: "Mon – Fri: 8am – 7pm, Sat: 9am – 5pm",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400",
    contact: "+234 83 231 500",
    rating: 4.5,
    reviews: 178,
    description: "Drugfield Pharmaceuticals is a trusted community pharmacy providing genuine, affordable medications to families in Owerri and surrounding areas. All medicines are sourced from NAFDAC-approved manufacturers.",
    services: ["Prescription Dispensing", "OTC Drugs", "Medical Devices", "Chronic Disease Medications", "Family Planning Products"],
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    name: "Alpha Pharmacy",
    location: "New GRA, Port Harcourt",
    openingHours: "24 hours, 7 days a week",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400",
    contact: "+234 84 462 100",
    rating: 4.6,
    reviews: 241,
    description: "Alpha Pharmacy operates 24/7, ensuring you can access medications and healthcare products at any time. They have a team of qualified pharmacists available around the clock for consultation.",
    services: ["24/7 Dispensing", "Emergency Medications", "Pharmacist Consultation", "Malaria & Fever Management", "Surgical Supplies"],
    createdAt: "2024-01-01",
  },
  {
    id: "5",
    name: "StrongNation Pharmacy",
    location: "Bodija, Ibadan",
    openingHours: "Mon – Sat: 7:30am – 8pm",
    isVerified: false,
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400",
    contact: "+234 2 811 4000",
    rating: 4.2,
    reviews: 134,
    description: "StrongNation Pharmacy is a community pharmacy serving Ibadan residents with affordable medications and healthcare essentials. They pride themselves on knowledgeable staff and genuine products.",
    services: ["Prescription Drugs", "OTC Medications", "Herbal Products", "Vitamins & Supplements", "Baby Formula"],
    createdAt: "2024-01-01",
  },
  {
    id: "6",
    name: "Kachifo Pharmacy",
    location: "Kano Central, Kano",
    openingHours: "Mon – Sat: 8am – 6pm",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
    contact: "+234 64 317 000",
    rating: 4.4,
    reviews: 198,
    description: "Kachifo Pharmacy is a NAFDAC-registered pharmacy in Kano providing quality pharmaceutical products and services. The pharmacy is staffed by licensed pharmacists who offer professional advice.",
    services: ["Prescription Dispensing", "Antibiotic Dispensing", "Family Planning", "Child Health Products", "Hypertension Medications"],
    createdAt: "2024-01-01",
  },
];
