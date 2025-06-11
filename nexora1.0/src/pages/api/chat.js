import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const intents = {
  "class_schedule": {
    keywords: ["class", "schedule", "lecture", "today's class", "my classes", "next lecture"],
    handler: async (message, docs) => {
      const [degreeMatch] = message.match(/(cs|ee|comp|elec)/i) || [null];
      const [batchMatch] = message.match(/batch (\w+)/i) || [null];
      if (degreeMatch && batchMatch) {
        const doc = docs.find(d => d.id === degreeMatch && d.data().batchNumber === batchMatch);
        return doc
          ? `Here’s your schedule for ${degreeMatch.toUpperCase()} ${batchMatch}: ${JSON.stringify(doc.data())}. Let me know if you need help planning your day!`
          : `I couldn’t find a schedule for ${degreeMatch.toUpperCase()} ${batchMatch}. Maybe check with your department?`;
      }
      return "Please let me know your degree (e.g., cs, ee) and batch (e.g., CS2023) so I can help you with your classes!";
    }
  },
  "cafeteria_menu": {
    keywords: ["menu", "food", "what’s for lunch", "cafeteria", "dining", "today’s meal"],
    handler: async (message, docs) => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const doc = docs.find(d => d.id === today);
      return doc
        ? `Today’s menu (${today}): ${JSON.stringify(doc.data())}. Looks delicious—enjoy your meal! Any favorites?`
        : `No menu set for ${today} yet. I’ll keep you posted when it’s updated!`;
    }
  },
  "bus_schedule": {
    keywords: ["bus", "schedule", "transport", "when’s the bus", "bus times", "get me home"],
    handler: async (message, docs) => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const doc = docs.find(d => d.id === today);
      return doc
        ? `Bus times for ${today}: ${JSON.stringify(doc.data())}. Safe travels—let me know if you need route tips!`
        : `No bus schedule for ${today} yet. I’ll notify you when it’s available!`;
    }
  },
  "events": {
    keywords: ["event", "events", "what’s happening", "reminder", "campus activities", "fun stuff"],
    handler: async (message, docs) => {
      return docs.length > 0
        ? `Here are the upcoming events: ${JSON.stringify(docs.map(d => d.data()))}. Exciting times ahead—want details on any?`
        : "No events scheduled right now. I’ll let you know when something pops up!";
    }
  },
  "faq": {
    keywords: ["faq", "help", "info", "how do i", "campus rules", "support"],
    handler: async (message) => {
      const faqResponses = {
        "how do i": "What would you like to know? For most things, check the university website or ask me for a quick tip!",
        "campus rules": "Rules vary by area—generally, keep it respectful! Want specifics on parking or dorms?",
        "support": "I’m here to help! Tell me what you need, or visit the student support office."
      };
      return faqResponses[message.split()[0]] || "For campus help, check the website or ask me something specific—I’m all ears!";
    }
  },
  "general_chat": {
    keywords: ["hi", "hello", "how is your day", "how are you", "bye", "thanks", "what’s up", "good morning", "good night"],
    handler: async (message, _, context = {}) => {
      const responses = {
        "hi": "Hey! Great to see you—how can I brighten your day?",
        "hello": "Hi there! Ready to dive into campus life together?",
        "how is your day": "My day’s awesome thanks to you! How’s yours going so far?",
        "how are you": "I’m doing fantastic! How about you—any campus adventures today?",
        "bye": "Take care! Pop back anytime—I’ll be here!",
        "thanks": "My pleasure! Always happy to help—what’s next on your mind?",
        "what’s up": "Just hanging out to assist you! What’s new on campus?",
        "good morning": "Good morning! Hope your day starts great—need a schedule check?",
        "good night": "Good night! Sweet dreams, and I’ll catch you tomorrow!"
      };
      const lastMessage = context.lastMessage || "";
      if (lastMessage.includes("class") && message.includes("thanks")) {
        return "Glad I could help with your class! Anything else to sort out today?";
      }
      if (lastMessage.includes("menu") && message.includes("thanks")) {
        return "Happy you liked the menu info! Want tips on other dining spots?";
      }
      context.lastMessage = message;
      return responses[message.split()[0]] || "Love chatting with you! Ask me about your day—schedules, food, or fun!";
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { message, context = {} } = req.body;
  if (!message) return res.status(400).json({ reply: 'Please send a message!' });

  try {
    let reply = "Hmm, I’m not sure what you mean. How about we talk about your day—classes, food, or events?";
    const lowerMessage = message.toLowerCase();

    // Fetch all documents from relevant collections
    const collections = ['schedules', 'cafeteria_menu', 'bus_times', 'events'];
    const allDocs = {};
    for (const coll of collections) {
      const snapshot = await getDocs(collection(db, coll));
      allDocs[coll] = snapshot.docs;
    }

    // Match intent with context
    for (const [intent, config] of Object.entries(intents)) {
      if (config.keywords.some(keyword => lowerMessage.includes(keyword))) {
        reply = await config.handler(message, allDocs[intent === 'events' ? 'events' : intent === 'class_schedule' ? 'schedules' : intent], context);
        break;
      }
    }

    return res.status(200).json({ reply, context });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ reply: 'Oops, something went wrong. Let’s try that again!' });
  }
}