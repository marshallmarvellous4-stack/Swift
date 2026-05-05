export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: string;
}

const DISCLAIMER =
  "\n\n⚠️ SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.";

const URGENT_SYMPTOMS = [
  "chest pain",
  "difficulty breathing",
  "can't breathe",
  "cannot breathe",
  "severe bleeding",
  "fainting",
  "fainted",
  "passed out",
  "stroke",
  "heart attack",
  "unconscious",
  "severe pain",
  "not breathing",
];

const KEYWORD_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["fever", "temperature", "hot body", "high temperature"],
    response:
      "I see you may have a fever. Here's some safe guidance:\n\n• Rest as much as possible and stay in a cool environment.\n• Drink plenty of fluids — water, coconut water, or oral rehydration solutions.\n• You can take paracetamol (acetaminophen) to reduce fever as directed on the package.\n• Sponge your body with lukewarm water.\n• Monitor your temperature regularly.\n\nSeek medical attention if:\n- Fever is above 39.5°C (103°F)\n- Fever lasts more than 3 days\n- You have a stiff neck, rash, or severe headache\n- An infant under 3 months has any fever",
  },
  {
    keywords: ["headache", "head pain", "head ache", "migraine"],
    response:
      "I understand you have a headache. Here are some safe steps:\n\n• Rest in a quiet, dark room.\n• Stay hydrated — dehydration is a common cause of headaches.\n• Apply a cold or warm compress to your forehead.\n• You can take paracetamol or ibuprofen as directed.\n• Avoid screens and bright lights.\n• Gentle neck stretches may help with tension headaches.\n\nSeek urgent care if:\n- Headache is sudden and severe ('thunderclap')\n- Associated with fever, stiff neck, or rash\n- Accompanied by confusion or vision changes\n- Following a head injury",
  },
  {
    keywords: ["malaria", "malaria symptoms"],
    response:
      "Malaria is a serious condition. Based on your symptoms, please take the following steps:\n\n• Visit a healthcare facility immediately for a malaria test (RDT or blood smear).\n• Do NOT start anti-malarial treatment without confirmation.\n• While waiting, rest, stay hydrated, and take paracetamol for fever.\n• Use mosquito nets and insect repellent.\n\nCommon malaria symptoms:\n- Fever and chills\n- Headache\n- Muscle aches\n- Nausea and vomiting\n- Sweating\n\nEarly diagnosis and treatment are critical. Please see a doctor as soon as possible.",
  },
  {
    keywords: ["cough", "coughing", "dry cough", "wet cough", "whooping cough"],
    response:
      "I see you're experiencing a cough. Here's some guidance:\n\n• Stay well-hydrated — warm fluids like tea with honey can help.\n• Use a humidifier if the air is dry.\n• Avoid smoking and second-hand smoke.\n• Honey (1 teaspoon) can soothe throat irritation.\n• Steam inhalation may provide relief.\n\nSee a doctor if:\n- Cough lasts more than 3 weeks\n- You cough up blood or yellow/green mucus\n- Accompanied by fever, shortness of breath, or chest pain\n- You have a history of asthma or chronic lung disease",
  },
  {
    keywords: [
      "stomach",
      "stomach ache",
      "stomach pain",
      "belly pain",
      "abdominal pain",
      "tummy ache",
    ],
    response:
      "I understand you have stomach pain. Here are some safe steps:\n\n• Avoid solid foods temporarily and stay hydrated.\n• Try the BRAT diet: Bananas, Rice, Applesauce, Toast.\n• Drink oral rehydration solution if experiencing diarrhea.\n• Apply a warm compress or heating pad to your abdomen.\n• Avoid spicy, fatty, or acidic foods.\n\nSeek immediate medical care if:\n- Severe pain that doesn't improve\n- Pain concentrated in the lower right abdomen (possible appendicitis)\n- Vomiting blood\n- Unable to pass stool with severe pain\n- High fever with abdominal pain",
  },
  {
    keywords: ["pregnancy", "pregnant", "expecting", "trimester"],
    response:
      "Congratulations on your pregnancy! Here's important guidance:\n\n• Schedule regular prenatal checkups with a qualified healthcare provider.\n• Take folic acid supplements as recommended by your doctor.\n• Eat a balanced diet rich in iron, calcium, and vitamins.\n• Avoid alcohol, smoking, and unprescribed medications.\n• Stay active with safe exercises like walking or prenatal yoga.\n• Get recommended vaccinations (flu, tetanus, etc.).\n\nContact your doctor immediately if you experience:\n- Heavy bleeding\n- Severe abdominal cramps\n- Decreased baby movement after 28 weeks\n- Severe headache or vision changes\n- Signs of labor before 37 weeks",
  },
  {
    keywords: ["stress", "anxious", "anxiety", "worried", "mental", "depressed", "depression"],
    response:
      "I hear you — mental health matters just as much as physical health. Here are some strategies:\n\n• Practice deep breathing: Inhale for 4 seconds, hold for 4, exhale for 6.\n• Engage in regular physical activity — even a 20-minute walk helps.\n• Talk to someone you trust about your feelings.\n• Limit social media and news consumption.\n• Establish a consistent sleep routine.\n• Practice mindfulness or meditation.\n• Connect with supportive friends or family.\n\nConsider speaking with a mental health professional if:\n- Feelings persist for more than 2 weeks\n- You have thoughts of self-harm\n- Symptoms interfere with daily functioning\n\nYou are not alone, and help is available.",
  },
  {
    keywords: ["tired", "fatigue", "weakness", "exhausted", "no energy"],
    response:
      "Feeling tired or fatigued is very common and has many possible causes:\n\n• Ensure you're getting 7-9 hours of quality sleep per night.\n• Stay hydrated — even mild dehydration causes fatigue.\n• Eat balanced, nutritious meals at regular intervals.\n• Reduce caffeine, especially in the afternoon.\n• Engage in light to moderate exercise daily.\n• Take breaks and manage stress levels.\n\nSee a doctor if:\n- Fatigue is severe and unexplained\n- Accompanied by shortness of breath, chest pain, or weight loss\n- Lasts more than 2 weeks with no clear cause\n- Affects your ability to perform daily activities",
  },
  {
    keywords: ["diabetes", "blood sugar", "glucose", "insulin"],
    response:
      "Managing diabetes requires careful attention. Here's some guidance:\n\n• Monitor your blood sugar regularly as advised by your doctor.\n• Follow a low-glycemic, balanced diet — limit sugary foods and refined carbs.\n• Exercise regularly: aim for at least 30 minutes most days.\n• Take medications exactly as prescribed — never skip doses.\n• Stay hydrated and avoid sugary drinks.\n• Check your feet daily for sores or infections.\n\nSeek urgent care if you experience:\n- Very high blood sugar (hyperglycemia): excessive thirst, frequent urination\n- Very low blood sugar (hypoglycemia): shakiness, confusion, sweating\n- Any of these symptoms require immediate attention from a healthcare provider.",
  },
  {
    keywords: ["diarrhea", "loose stool", "runny stool", "watery stool"],
    response:
      "Diarrhea can lead to dehydration quickly. Here's what to do:\n\n• Drink oral rehydration solution (ORS) to replace lost fluids and electrolytes.\n• Eat small, bland meals: plain rice, boiled potatoes, bananas, and toast.\n• Avoid dairy, fatty, and spicy foods temporarily.\n• Wash hands thoroughly and frequently.\n• Avoid anti-diarrheal medications unless advised by a doctor.\n\nSeek medical attention if:\n- Diarrhea lasts more than 2 days in adults, or 24 hours in children\n- Blood or mucus in stool\n- Signs of severe dehydration: extreme thirst, no urination, dizziness\n- High fever accompanying diarrhea",
  },
  {
    keywords: ["cold", "runny nose", "sneezing", "flu", "influenza", "sore throat"],
    response:
      "It sounds like you may have a cold or flu. Here's how to manage it:\n\n• Rest and get plenty of sleep to help your immune system recover.\n• Drink warm fluids: hot water, herbal teas, and broths.\n• Gargle with warm salt water for a sore throat.\n• Use saline nasal spray to relieve congestion.\n• Honey and lemon in warm water can soothe your throat.\n• Paracetamol can help with fever and body aches.\n\nSee a doctor if:\n- Symptoms worsen after 7 days instead of improving\n- Difficulty breathing or shortness of breath\n- High fever that doesn't respond to medication\n- You're in a high-risk group (elderly, immunocompromised, infant)",
  },
];

export function getChatbotResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  for (const urgent of URGENT_SYMPTOMS) {
    if (msg.includes(urgent)) {
      return (
        "🚨 URGENT: Based on what you've described, please seek emergency medical attention immediately.\n\nCall emergency services or go to the nearest hospital right away. These symptoms can be life-threatening.\n\nDo NOT wait or try to manage this at home." +
        DISCLAIMER
      );
    }
  }

  for (const { keywords, response } of KEYWORD_RESPONSES) {
    for (const keyword of keywords) {
      if (msg.includes(keyword)) {
        return response + DISCLAIMER;
      }
    }
  }

  const greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"];
  for (const g of greetings) {
    if (msg.includes(g)) {
      return "Hello! I'm your SwiftCare health assistant. I'm here to provide safe, general health guidance.\n\nYou can tell me how you're feeling, describe your symptoms, or ask about health topics like:\n• Malaria\n• Fever\n• Headache\n• Nutrition\n• Mental health\n\nHow can I help you today?" + DISCLAIMER;
    }
  }

  return "Thank you for sharing that with me. I want to make sure I give you accurate guidance.\n\nCould you describe your symptoms in more detail? For example:\n• When did it start?\n• How severe is it (1-10)?\n• Any other symptoms?\n\nThis will help me provide better guidance. However, for a proper diagnosis and treatment, please consult one of our verified doctors." + DISCLAIMER;
}

export function createMessage(
  text: string,
  sender: "user" | "assistant"
): ChatMessage {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    text,
    sender,
    timestamp: new Date().toISOString(),
  };
}
