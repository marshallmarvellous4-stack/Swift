export interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  readTime: number;
  image: string;
  publishedAt: string;
}

export const ARTICLES: Article[] = [
  {
    id: "1",
    title: "Malaria Prevention: What You Need to Know",
    category: "Prevention",
    summary:
      "Learn how to protect yourself and your family from malaria with these proven prevention strategies.",
    content:
      "Malaria is a life-threatening disease caused by parasites transmitted through the bites of infected female Anopheles mosquitoes. It is preventable and curable.\n\nKey Prevention Strategies:\n\n1. Sleep under insecticide-treated nets (ITNs) every night.\n2. Use indoor residual spraying (IRS) of insecticides.\n3. Apply insect repellent containing DEET on exposed skin.\n4. Wear long sleeves and trousers, especially during evening hours.\n5. Eliminate standing water around your home.\n6. Take antimalarial medications if traveling to high-risk areas.\n\nSymptoms of Malaria:\n- Fever and chills\n- Headache\n- Muscle aches\n- Fatigue\n- Nausea and vomiting\n\nIf you experience these symptoms, seek medical attention immediately. Early diagnosis and treatment are crucial for recovery.",
    readTime: 5,
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    publishedAt: "2026-04-20",
  },
  {
    id: "2",
    title: "Mental Health: Breaking the Stigma",
    category: "Mental Health",
    summary:
      "Understanding mental health and why seeking help is a sign of strength, not weakness.",
    content:
      "Mental health is just as important as physical health, yet it is often overlooked or stigmatized in many communities.\n\nWhat is Mental Health?\nMental health includes our emotional, psychological, and social well-being. It affects how we think, feel, and act.\n\nCommon Mental Health Conditions:\n- Depression\n- Anxiety disorders\n- Post-traumatic stress disorder (PTSD)\n- Bipolar disorder\n- Schizophrenia\n\nSigns You May Need Help:\n- Persistent sadness or feeling empty\n- Extreme mood changes\n- Withdrawal from friends and activities\n- Changes in sleeping or eating habits\n- Difficulty concentrating\n\nHow to Get Help:\n1. Talk to a trusted friend or family member\n2. Seek professional help from a therapist or psychiatrist\n3. Join a support group\n4. Practice self-care: exercise, adequate sleep, and healthy eating\n\nRemember: Asking for help is a sign of courage and strength.",
    readTime: 6,
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
    publishedAt: "2026-04-15",
  },
  {
    id: "3",
    title: "Nutrition for a Healthy Life",
    category: "Nutrition",
    summary:
      "Discover the fundamentals of balanced nutrition and how food choices impact your overall health.",
    content:
      "Good nutrition is one of the most powerful tools for preventing disease and maintaining optimal health.\n\nThe Basics of a Balanced Diet:\n\n1. Carbohydrates: Your main energy source. Choose whole grains, vegetables, and fruits over refined sugars.\n\n2. Proteins: Essential for muscle repair and growth. Include lean meats, beans, eggs, and dairy.\n\n3. Fats: Necessary for brain function and hormone production. Choose healthy fats from avocados, nuts, and olive oil.\n\n4. Vitamins and Minerals: Found in colorful fruits and vegetables. Aim for at least 5 servings per day.\n\n5. Water: Stay hydrated. Drink at least 8 glasses of water daily.\n\nFoods to Limit:\n- Processed and ultra-processed foods\n- Sugary beverages\n- Excessive salt\n- Trans fats\n\nSimple Tips:\n- Cook more meals at home\n- Read food labels\n- Practice mindful eating\n- Eat smaller, more frequent meals",
    readTime: 7,
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
    publishedAt: "2026-04-10",
  },
  {
    id: "4",
    title: "Vaccination: Your Shield Against Disease",
    category: "Vaccination",
    summary:
      "Why vaccines are essential for individual and community health, and the vaccines you should not miss.",
    content:
      "Vaccines are one of the most effective public health tools ever developed. They protect individuals and communities from dangerous, often deadly, diseases.\n\nHow Vaccines Work:\nVaccines train your immune system to recognize and fight specific pathogens without causing the disease itself. When you are vaccinated, your body learns to defend against that infection.\n\nEssential Vaccines for Adults:\n- COVID-19 vaccines and boosters\n- Influenza (flu) vaccine — annually\n- Tetanus, diphtheria, pertussis (Tdap)\n- Hepatitis B\n- Meningococcal vaccine\n\nVaccines for Children:\n- BCG (tuberculosis protection)\n- Oral polio vaccine\n- Measles, mumps, rubella (MMR)\n- Rotavirus vaccine\n- Yellow fever vaccine\n\nCommon Myths Debunked:\n- Vaccines do NOT cause autism\n- Vaccines are NOT just for children\n- Natural immunity is NOT always better than vaccine immunity\n\nStay up to date with your vaccinations. Consult your doctor about which vaccines are right for you.",
    readTime: 6,
    image:
      "https://images.unsplash.com/photo-1612277795421-9bc7706a4a41?w=400",
    publishedAt: "2026-04-05",
  },
  {
    id: "5",
    title: "First Aid Essentials Everyone Should Know",
    category: "First Aid",
    summary:
      "Life-saving first aid techniques that could make a critical difference in an emergency.",
    content:
      "Knowing basic first aid can save a life. Here are the most important techniques everyone should know.\n\n1. CPR (Cardiopulmonary Resuscitation):\n- Call for emergency help first\n- Place the heel of your hand on the center of the chest\n- Push down hard and fast (100-120 compressions per minute)\n- Give rescue breaths if trained to do so\n\n2. Choking:\n- For adults: Perform the Heimlich maneuver\n- For infants: Give back blows and chest thrusts\n\n3. Bleeding:\n- Apply direct pressure with a clean cloth\n- Do not remove the cloth; add more if needed\n- Elevate the injured area if possible\n\n4. Burns:\n- Cool the burn with cool (not cold) running water for 10-20 minutes\n- Do not use ice, butter, or toothpaste\n- Cover with a sterile bandage\n\n5. Fractures:\n- Immobilize the injured area\n- Apply ice to reduce swelling\n- Seek medical attention\n\nAlways Call Emergency Services:\nFor severe situations, call your local emergency number immediately. First aid is a bridge — not a replacement — for professional medical care.",
    readTime: 8,
    image:
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400",
    publishedAt: "2026-03-30",
  },
  {
    id: "6",
    title: "Managing Diabetes: A Practical Guide",
    category: "Chronic Disease",
    summary:
      "Practical tips for managing diabetes through lifestyle changes, medication, and regular monitoring.",
    content:
      "Diabetes is a chronic condition that affects millions of people worldwide. With proper management, people with diabetes can live long, healthy lives.\n\nTypes of Diabetes:\n- Type 1: The body produces little or no insulin\n- Type 2: The body does not use insulin effectively\n- Gestational: Develops during pregnancy\n\nKey Management Strategies:\n\n1. Blood Sugar Monitoring:\nCheck your blood glucose regularly as advised by your doctor. Keep a log of your readings.\n\n2. Healthy Eating:\n- Choose low-glycemic foods\n- Control portion sizes\n- Limit sugar and refined carbs\n- Eat at regular times\n\n3. Physical Activity:\n- Aim for 150 minutes of moderate exercise per week\n- Walking, swimming, and cycling are excellent options\n\n4. Medication:\nTake medications exactly as prescribed. Never skip doses.\n\n5. Regular Check-ups:\n- HbA1c test every 3-6 months\n- Annual eye, kidney, and foot exams\n\nWarning Signs:\n- Excessive thirst or urination\n- Unexplained weight loss\n- Blurred vision\n- Slow-healing wounds\n\nConsult your doctor if you experience any of these symptoms.",
    readTime: 9,
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400",
    publishedAt: "2026-03-25",
  },
];

export const CATEGORIES = [
  "All",
  "Prevention",
  "Mental Health",
  "Nutrition",
  "Vaccination",
  "First Aid",
  "Chronic Disease",
];
