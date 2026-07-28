/**
 * Seed script — run once to populate sample data.
 * Usage: pnpm --filter @workspace/api-server run seed
 *
 * Safe to re-run: skips tables that already have rows.
 */
import bcrypt from "bcryptjs";
import {
  db,
  usersTable,
  doctorsTable,
  hospitalsTable,
  labsTable,
  pharmaciesTable,
  educationPostsTable,
} from "@workspace/db";
import { pool } from "@workspace/db";

async function main() {
  console.log("🌱  Starting seed…");

  // ── Users ────────────────────────────────────────────────────────────────────
  const existingUsers = await db.select({ id: usersTable.id }).from(usersTable);
  if (existingUsers.length === 0) {
    const adminHash = await bcrypt.hash("Admin@1234", 12);
    const userHash = await bcrypt.hash("User@1234", 12);

    await db.insert(usersTable).values([
      {
        fullName: "Admin SwiftCare",
        email: "admin@swiftcare.ng",
        passwordHash: adminHash,
        role: "admin",
        sex: "male",
        stateOfOrigin: "Lagos",
        mobileNumber: "08001234567",
        isVerified: true,
      },
      {
        fullName: "Demo User",
        email: "demo@swiftcare.ng",
        passwordHash: userHash,
        role: "user",
        sex: "female",
        stateOfOrigin: "Abuja",
        mobileNumber: "08007654321",
        isVerified: true,
      },
    ]);
    console.log("  ✔ users");
  } else {
    console.log("  – users (skipped, already has rows)");
  }

  // ── Doctors ──────────────────────────────────────────────────────────────────
  const existingDoctors = await db.select({ id: doctorsTable.id }).from(doctorsTable);
  if (existingDoctors.length === 0) {
    await db.insert(doctorsTable).values([
      {
        name: "Dr. Amara Okafor",
        specialty: "General Practitioner",
        experience: 8,
        location: "Lagos, Nigeria",
        availability: "online",
        consultationFee: 5000,
        rating: 4.9,
        reviewCount: 312,
        languages: "English,Igbo",
        bio: "Dr. Amara Okafor is a dedicated General Practitioner with over 8 years of experience providing comprehensive primary care. She is passionate about preventive medicine and patient education.",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
        email: "amara.okafor@swiftcare.ng",
      },
      {
        name: "Dr. Chukwuemeka Nwosu",
        specialty: "Cardiologist",
        experience: 15,
        location: "Abuja, Nigeria",
        availability: "online",
        consultationFee: 12000,
        rating: 4.8,
        reviewCount: 189,
        languages: "English,Igbo",
        bio: "Prof. Chukwuemeka Nwosu is a leading cardiologist specialising in interventional cardiology and heart failure management. Fellow of the West African College of Physicians.",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
        email: "chukwuemeka.nwosu@swiftcare.ng",
      },
      {
        name: "Dr. Fatima Al-Hassan",
        specialty: "Pediatrician",
        experience: 10,
        location: "Kano, Nigeria",
        availability: "busy",
        consultationFee: 7500,
        rating: 4.7,
        reviewCount: 245,
        languages: "English,Hausa,Arabic",
        bio: "Dr. Fatima Al-Hassan is a compassionate pediatrician who has dedicated her career to improving child health outcomes across northern Nigeria.",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80",
        email: "fatima.alhassan@swiftcare.ng",
      },
      {
        name: "Dr. Olumide Adeyemi",
        specialty: "Dermatologist",
        experience: 6,
        location: "Ibadan, Nigeria",
        availability: "online",
        consultationFee: 8000,
        rating: 4.6,
        reviewCount: 134,
        languages: "English,Yoruba",
        bio: "Dr. Olumide Adeyemi is a board-certified dermatologist specialising in skin conditions common to melanin-rich skin, including acne, hyperpigmentation and eczema.",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
        email: "olumide.adeyemi@swiftcare.ng",
      },
      {
        name: "Dr. Ngozi Eze",
        specialty: "Gynaecologist",
        experience: 12,
        location: "Port Harcourt, Nigeria",
        availability: "offline",
        consultationFee: 10000,
        rating: 4.9,
        reviewCount: 278,
        languages: "English,Igbo",
        bio: "Dr. Ngozi Eze is a highly respected obstetrician and gynaecologist with expertise in high-risk pregnancies, fertility issues, and minimally invasive gynaecological surgery.",
        image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&q=80",
        email: "ngozi.eze@swiftcare.ng",
      },
      {
        name: "Dr. Babatunde Lawal",
        specialty: "Psychiatrist",
        experience: 9,
        location: "Lagos, Nigeria",
        availability: "online",
        consultationFee: 9000,
        rating: 4.8,
        reviewCount: 156,
        languages: "English,Yoruba",
        bio: "Dr. Babatunde Lawal is a consultant psychiatrist committed to destigmatising mental health in Nigeria. He specialises in depression, anxiety disorders, and substance use.",
        image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=80",
        email: "babatunde.lawal@swiftcare.ng",
      },
    ]);
    console.log("  ✔ doctors");
  } else {
    console.log("  – doctors (skipped)");
  }

  // ── Hospitals ────────────────────────────────────────────────────────────────
  const existingHospitals = await db.select({ id: hospitalsTable.id }).from(hospitalsTable);
  if (existingHospitals.length === 0) {
    await db.insert(hospitalsTable).values([
      {
        name: "Lagos University Teaching Hospital",
        location: "Idi-Araba, Lagos",
        type: "Teaching Hospital",
        services: "Emergency,Cardiology,Neurology,Oncology,Pediatrics,Surgery,ICU",
        openingHours: "24/7",
        contact: "+234 1 774 0000",
        image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80",
      },
      {
        name: "National Hospital Abuja",
        location: "Central Business District, Abuja",
        type: "Federal Hospital",
        services: "Emergency,Cardiology,Orthopedics,Ophthalmology,Dialysis,MRI,CT Scan",
        openingHours: "24/7",
        contact: "+234 9 461 0000",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80",
      },
      {
        name: "Reddington Hospital",
        location: "Victoria Island, Lagos",
        type: "Private Hospital",
        services: "Emergency,Maternity,Cardiology,Physiotherapy,Laboratory,Pharmacy",
        openingHours: "24/7",
        contact: "+234 1 279 2000",
        image: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=400&q=80",
      },
      {
        name: "University College Hospital Ibadan",
        location: "Queen Elizabeth Rd, Ibadan",
        type: "Teaching Hospital",
        services: "Emergency,Psychiatry,Dermatology,ENT,Dental,Radiology,Oncology",
        openingHours: "24/7",
        contact: "+234 2 241 1768",
        image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&q=80",
      },
    ]);
    console.log("  ✔ hospitals");
  } else {
    console.log("  – hospitals (skipped)");
  }

  // ── Labs ─────────────────────────────────────────────────────────────────────
  const existingLabs = await db.select({ id: labsTable.id }).from(labsTable);
  if (existingLabs.length === 0) {
    await db.insert(labsTable).values([
      {
        name: "Lancet Laboratories",
        location: "Victoria Island, Lagos",
        availableTests: "Full Blood Count,Malaria Parasite,HIV Screening,Hepatitis B & C,Typhoid,Kidney Function,Liver Function,Blood Glucose,Lipid Profile,Thyroid Panel",
        openingHours: "Mon–Sat 7am–7pm",
        priceRange: "₦2,000 – ₦45,000",
        contact: "+234 1 461 6200",
        image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&q=80",
      },
      {
        name: "Clinix Healthcare",
        location: "Wuse II, Abuja",
        availableTests: "Complete Metabolic Panel,COVID-19 PCR,Pregnancy Test,Urinalysis,Stool Culture,Sickle Cell,ECG,Ultrasound",
        openingHours: "Mon–Fri 7am–6pm, Sat 8am–3pm",
        priceRange: "₦1,500 – ₦30,000",
        contact: "+234 9 291 3000",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80",
      },
      {
        name: "PathCare Nigeria",
        location: "GRA, Port Harcourt",
        availableTests: "Pap Smear,Hormonal Panel,Fertility Tests,Genetic Screening,Drug Toxicology,Allergy Panel,Bone Density",
        openingHours: "Mon–Sat 7:30am–6pm",
        priceRange: "₦3,000 – ₦60,000",
        contact: "+234 84 462 000",
        image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80",
      },
    ]);
    console.log("  ✔ labs");
  } else {
    console.log("  – labs (skipped)");
  }

  // ── Pharmacies ───────────────────────────────────────────────────────────────
  const existingPharmacies = await db.select({ id: pharmaciesTable.id }).from(pharmaciesTable);
  if (existingPharmacies.length === 0) {
    await db.insert(pharmaciesTable).values([
      {
        name: "HealthPlus Pharmacy",
        location: "Lekki Phase 1, Lagos",
        openingHours: "Mon–Sun 8am–10pm",
        isVerified: true,
        contact: "+234 1 279 5000",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      },
      {
        name: "MedPlus Pharmacy",
        location: "Ikeja, Lagos",
        openingHours: "Mon–Sat 8am–9pm, Sun 10am–6pm",
        isVerified: true,
        contact: "+234 1 270 3000",
        image: "https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&q=80",
      },
      {
        name: "Alpha Pharmacy",
        location: "Garki, Abuja",
        openingHours: "Mon–Fri 8am–8pm, Sat 9am–5pm",
        isVerified: true,
        contact: "+234 9 461 2200",
        image: "https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=400&q=80",
      },
      {
        name: "Wellspring Pharmacy",
        location: "Trans Amadi, Port Harcourt",
        openingHours: "Mon–Sun 8am–10pm",
        isVerified: false,
        contact: "+234 84 235 600",
        image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80",
      },
    ]);
    console.log("  ✔ pharmacies");
  } else {
    console.log("  – pharmacies (skipped)");
  }

  // ── Education Posts ──────────────────────────────────────────────────────────
  const existingPosts = await db.select({ id: educationPostsTable.id }).from(educationPostsTable);
  if (existingPosts.length === 0) {
    await db.insert(educationPostsTable).values([
      {
        title: "Understanding Malaria: Prevention and Treatment",
        category: "Infectious Disease",
        image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&q=80",
        content: `Malaria remains one of Nigeria's most significant public health challenges, with hundreds of thousands of cases reported annually. Understanding how to prevent and treat malaria is critical for every Nigerian.

**What is Malaria?**
Malaria is caused by Plasmodium parasites transmitted through the bites of infected female Anopheles mosquitoes. The most dangerous species in Nigeria is Plasmodium falciparum.

**Symptoms to Watch For**
- High fever (often with chills and sweating)
- Severe headache
- Muscle aches and fatigue
- Nausea, vomiting, and diarrhoea
- In severe cases: confusion, seizures, difficulty breathing

**Prevention Strategies**
1. **Use insecticide-treated bed nets (ITNs)** every night — this is the single most effective preventive measure.
2. **Indoor residual spraying** with approved insecticides.
3. **Eliminate standing water** around your home where mosquitoes breed.
4. **Wear protective clothing** — long sleeves and trousers in the evenings.
5. **Chemoprophylaxis** for pregnant women and travellers as recommended by a doctor.

**Treatment**
Seek medical attention immediately if malaria is suspected. First-line treatment in Nigeria is Artemisinin-based Combination Therapy (ACT). Do not self-medicate — incorrect treatment contributes to drug resistance.

⚠️ SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.`,
      },
      {
        title: "Mental Health in Nigeria: Breaking the Stigma",
        category: "Mental Health",
        image: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=400&q=80",
        content: `Mental health conditions affect approximately 1 in 4 Nigerians at some point in their lives, yet fewer than 10% ever receive care. Stigma, lack of awareness, and limited access to services remain major barriers.

**Common Mental Health Conditions**
- **Depression**: Persistent low mood, loss of interest, fatigue, and feelings of worthlessness.
- **Anxiety Disorders**: Excessive worry, panic attacks, phobias, and social anxiety.
- **Bipolar Disorder**: Episodes of mania and depression.
- **Schizophrenia**: Hallucinations, delusions, and disorganised thinking.
- **Post-Traumatic Stress Disorder (PTSD)**: Following exposure to traumatic events.

**Warning Signs**
- Prolonged sadness or irritability
- Withdrawal from family and friends
- Changes in sleep or appetite
- Difficulty concentrating
- Thoughts of self-harm or suicide

**Seeking Help**
Mental health conditions are medical conditions — not spiritual failures or signs of weakness. Effective treatments include therapy (CBT, counselling), medication, and lifestyle changes.

**Self-Care Strategies**
- Regular physical exercise
- Adequate sleep (7–9 hours for adults)
- Strong social connections
- Mindfulness and relaxation techniques
- Limiting alcohol and avoiding illicit substances

If you or someone you know is in crisis, please contact a mental health professional immediately.

⚠️ SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.`,
      },
      {
        title: "Healthy Eating on a Nigerian Budget",
        category: "Nutrition",
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80",
        content: `Good nutrition does not have to be expensive. Nigerian cuisine is naturally rich in nutrients — the key is making informed choices with the foods already available in local markets.

**The Building Blocks of a Healthy Nigerian Diet**

**Carbohydrates (Energy)**
Choose complex carbohydrates: yam, sweet potato, brown rice, whole-grain garri, and oatmeal provide sustained energy and more fibre than refined options.

**Proteins (Building Blocks)**
Affordable protein sources include: beans (ewa), lentils, eggs, dried fish (stockfish, crayfish), chicken, and tofu. Aim for protein at every main meal.

**Vegetables and Fruits**
Ugwu (fluted pumpkin), waterleaf, spinach, tomatoes, peppers, garden eggs, and ugu are nutrient-dense and widely available. Seasonal fruits like mangoes, pawpaw, oranges, and pineapples are excellent vitamin sources.

**Healthy Fats**
Palm oil (in moderation), groundnuts, avocado, and fish provide essential fatty acids.

**Practical Tips**
1. **Cook at home** whenever possible — it is significantly cheaper and healthier than processed foods.
2. **Buy in bulk** and in season to reduce costs.
3. **Reduce salt** — use natural spices (crayfish, uziza, ehuru) for flavour instead.
4. **Limit sugary drinks** — replace zobo and malt with water or fresh juices.
5. **Portion control** — a healthy plate is half vegetables, a quarter protein, a quarter carbohydrate.

⚠️ SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.`,
      },
      {
        title: "Essential Vaccinations Every Nigerian Should Know",
        category: "Preventive Health",
        image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&q=80",
        content: `Vaccines are one of the most cost-effective public health interventions. Nigeria's National Programme on Immunisation (NPI) provides free vaccines for children, but adults also need certain vaccinations.

**Childhood Vaccines (National Schedule)**
- **BCG** (at birth) — protects against tuberculosis
- **Hepatitis B** (at birth, 6, 10, 14 weeks) — prevents liver disease
- **Polio (OPV/IPV)** — Nigeria is close to polio eradication; every dose matters
- **Pentavalent vaccine** (DPT-HepB-Hib) — protects against diphtheria, pertussis, tetanus, hepatitis B, and Hib meningitis
- **Pneumococcal vaccine (PCV)** — prevents pneumonia
- **Rotavirus** — prevents severe diarrhoea
- **Measles/MR** — at 9 and 15 months
- **Yellow Fever** — required for all Nigerians; valid for life
- **Meningitis A (MenAfriVac)** — for children in the meningitis belt

**Adult Vaccines to Consider**
- **Tetanus Toxoid (TT)** — especially for pregnant women and wound injuries
- **Hepatitis B** booster if not immunised as a child
- **COVID-19** — approved vaccines are safe and effective
- **Influenza** — annually for high-risk groups (elderly, pregnant, immunocompromised)
- **HPV** — for girls and women aged 9–45 to prevent cervical cancer

Visit the nearest Primary Health Care (PHC) centre to access free childhood vaccines.

⚠️ SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.`,
      },
      {
        title: "First Aid: What To Do in a Medical Emergency",
        category: "First Aid",
        image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&q=80",
        content: `Knowing basic first aid can mean the difference between life and death. Here are essential skills every Nigerian should know.

**The ABC of First Aid**
- **A — Airway**: Ensure the airway is clear. Tilt the head back and lift the chin.
- **B — Breathing**: Check for breathing. If absent, begin CPR.
- **C — Circulation**: Control bleeding with firm pressure on the wound.

**CPR (Cardiopulmonary Resuscitation)**
1. Place the heel of your hand on the centre of the chest.
2. Interlock your fingers and press down 5–6 cm, 100–120 times per minute.
3. After 30 compressions, give 2 rescue breaths (if trained).
4. Continue until help arrives or the person recovers.

**Choking**
- For conscious adults: give 5 back blows between the shoulder blades, then 5 abdominal thrusts (Heimlich manoeuvre).
- For infants: 5 back blows + 5 chest thrusts (never abdominal thrusts).

**Burns**
1. Cool the burn with cool (not cold) running water for at least 20 minutes.
2. Do NOT apply toothpaste, butter, or ice.
3. Cover loosely with a clean cloth or cling film.
4. Seek medical attention for burns larger than the palm.

**Seizures**
- Do NOT restrain the person or put anything in their mouth.
- Clear the area of hazards.
- Time the seizure. If it lasts more than 5 minutes, call for emergency help immediately.
- Place them in the recovery position after the seizure ends.

**Important**: First aid is a bridge — always seek professional medical care after an emergency.

⚠️ SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.`,
      },
      {
        title: "Living With Diabetes: A Practical Guide for Nigerians",
        category: "Chronic Disease",
        image: "https://images.unsplash.com/photo-1593491205049-7f032d28cf5e?w=400&q=80",
        content: `Diabetes is rapidly increasing in Nigeria, with the International Diabetes Federation estimating over 5 million adults living with the condition. Most cases go undiagnosed for years. Understanding diabetes can transform outcomes.

**Types of Diabetes**
- **Type 1**: The pancreas produces little or no insulin. Usually diagnosed in childhood. Requires daily insulin.
- **Type 2**: The body does not use insulin effectively. Most common type — strongly linked to lifestyle.
- **Gestational Diabetes**: Occurs during pregnancy and usually resolves after delivery, but increases future Type 2 risk.

**Warning Signs**
- Frequent urination
- Excessive thirst
- Unexplained weight loss
- Blurred vision
- Slow-healing wounds
- Tingling or numbness in the feet

**Managing Type 2 Diabetes**

**Diet**
- Reduce refined carbohydrates (white rice, white bread, sugary drinks)
- Increase fibre (vegetables, beans, whole grains)
- Eat smaller, more frequent meals
- Limit saturated fats and salt

**Physical Activity**
At least 150 minutes of moderate exercise per week (brisk walking, cycling, swimming) significantly improves blood sugar control.

**Medication**
Never stop or alter diabetes medication without consulting your doctor. Metformin is the most common first-line medication.

**Monitoring**
- Check blood glucose regularly as advised by your doctor
- Attend all clinic appointments
- Check your feet daily for wounds or changes

**Complications to Prevent**
Uncontrolled diabetes damages blood vessels and nerves, leading to kidney disease, blindness, heart disease, and limb amputations — all largely preventable with good control.

⚠️ SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.`,
      },
    ]);
    console.log("  ✔ education posts");
  } else {
    console.log("  – education posts (skipped)");
  }

  console.log("🎉  Seed complete.");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
