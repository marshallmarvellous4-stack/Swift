export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  location: string;
  availability: string;
  rating: number;
  reviews: number;
  bio: string;
  image: string;
  email: string;
  fee: number;
}

export const DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Amara Okafor",
    specialty: "General Practitioner",
    experience: 12,
    location: "Lagos, Nigeria",
    availability: "Mon - Fri, 9am - 5pm",
    rating: 4.9,
    reviews: 234,
    bio: "Dr. Amara Okafor is a board-certified General Practitioner with over 12 years of experience providing comprehensive primary care. She specializes in preventive medicine and chronic disease management.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    email: "a.okafor@swiftcare.com",
    fee: 5000,
  },
  {
    id: "2",
    name: "Dr. Chukwuemeka Nwosu",
    specialty: "Cardiologist",
    experience: 18,
    location: "Abuja, Nigeria",
    availability: "Tue - Sat, 10am - 4pm",
    rating: 4.8,
    reviews: 189,
    bio: "Dr. Chukwuemeka Nwosu is a leading cardiologist with 18 years of expertise in diagnosing and treating heart conditions. He holds fellowship from the Nigerian Cardiac Society.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    email: "c.nwosu@swiftcare.com",
    fee: 12000,
  },
  {
    id: "3",
    name: "Dr. Fatima Al-Hassan",
    specialty: "Pediatrician",
    experience: 9,
    location: "Kano, Nigeria",
    availability: "Mon - Thu, 8am - 3pm",
    rating: 4.95,
    reviews: 312,
    bio: "Dr. Fatima Al-Hassan is a compassionate pediatrician dedicated to the health and wellbeing of children from newborns to adolescents. She specializes in childhood immunization and developmental care.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    email: "f.alhassan@swiftcare.com",
    fee: 7500,
  },
  {
    id: "4",
    name: "Dr. Babatunde Adeleke",
    specialty: "Dermatologist",
    experience: 14,
    location: "Port Harcourt, Nigeria",
    availability: "Wed - Sat, 11am - 6pm",
    rating: 4.7,
    reviews: 156,
    bio: "Dr. Babatunde Adeleke is a certified dermatologist with expertise in skin conditions, cosmetic dermatology, and skin cancer screening. He has treated thousands of patients across Nigeria.",
    image: "https://randomuser.me/api/portraits/men/55.jpg",
    email: "b.adeleke@swiftcare.com",
    fee: 9000,
  },
  {
    id: "5",
    name: "Dr. Ngozi Eze",
    specialty: "Gynecologist",
    experience: 16,
    location: "Enugu, Nigeria",
    availability: "Mon - Fri, 9am - 4pm",
    rating: 4.85,
    reviews: 278,
    bio: "Dr. Ngozi Eze is a highly experienced gynecologist specializing in women's reproductive health, prenatal care, and minimally invasive surgeries. She is passionate about women's empowerment through health.",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
    email: "n.eze@swiftcare.com",
    fee: 10000,
  },
  {
    id: "6",
    name: "Dr. Emmanuel Taiwo",
    specialty: "Psychiatrist",
    experience: 11,
    location: "Ibadan, Nigeria",
    availability: "Mon - Wed, 9am - 5pm",
    rating: 4.75,
    reviews: 143,
    bio: "Dr. Emmanuel Taiwo is a qualified psychiatrist with a deep understanding of mental health disorders. He provides compassionate care for depression, anxiety, PTSD, and other conditions.",
    image: "https://randomuser.me/api/portraits/men/77.jpg",
    email: "e.taiwo@swiftcare.com",
    fee: 8500,
  },
];
