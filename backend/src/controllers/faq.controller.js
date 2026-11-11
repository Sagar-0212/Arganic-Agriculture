import FAQ from '../models/faq.model.js';

// Default FAQs to seed if DB is empty
const DEFAULT_FAQS = [
  {
    question: "Are all Arya Malhar products 100% certified organic?",
    answer: "Yes, 100%! All our agricultural produce, grains, pulses, fruits, and Ayurvedic products are grown using pure organic and natural farming techniques without synthetic chemicals or pesticides. They are certified under the Maharashtra Organic Farming Initiative.",
    category: "Products & Organic",
    keywords: ["organic", "certificate", "certified", "chemical free", "natural", "pure"],
    isPopular: true,
    order: 1
  },
  {
    question: "How do you guarantee the products are 100% organic?",
    answer: "Every batch undergoes testing and holds organic certifications under standard Indian NPOP inspection boards. Traceability links on our batch invoices specify grower origin.",
    category: "Products & Organic",
    keywords: ["guarantee", "npop", "testing", "organic", "traceability"],
    isPopular: true,
    order: 2
  },
  {
    question: "What is the Krushibhushan connection?",
    answer: "Our founder Sunil Bhosale won the prestigious state award for showing that organic models yield higher crop outputs when soil inputs are bio-composted correctly. He manages our guidelines.",
    category: "General",
    keywords: ["krushibhushan", "sunil bhosale", "founder", "award", "soil"],
    isPopular: true,
    order: 3
  },
  {
    question: "Do you ship outside Pune and Mumbai?",
    answer: "Currently, fresh vegetables are delivered only inside Pune and Mumbai to prevent spoilage. Dry grains, flour, vermicompost, and powders are shipped pan-India.",
    category: "Shipping & Delivery",
    keywords: ["pune", "mumbai", "ship", "delivery", "veggies", "pan india"],
    isPopular: true,
    order: 4
  },
  {
    question: "How does cash on delivery work?",
    answer: "Simply select Cash on Delivery during checkout. Our delivery executives will collect the payment via cash or local UPI QR scanner at your doorstep.",
    category: "Ordering & Payments",
    keywords: ["cash on delivery", "cod", "doorstep", "upi qr", "payment"],
    isPopular: true,
    order: 5
  },
  {
    question: "Where is Arya Malhar Farms located?",
    answer: "Arya Malhar Ayurvedic Pharmacy & Farms is located at Gat No. 163/351 A/p. Dhangaon, Tal. Palus, Dist. Sangli 416303, Maharashtra.",
    category: "General",
    keywords: ["location", "address", "dhangaon", "sangli", "palus", "where"],
    isPopular: true,
    order: 6
  },
  {
    question: "How long does shipping & delivery take?",
    answer: "Standard delivery across Maharashtra takes 2 to 4 business days. For express orders within Sangli, Satara, and Kolhapur districts, delivery is usually completed within 24 to 48 hours.",
    category: "Shipping & Delivery",
    keywords: ["shipping", "delivery", "time", "days", "dispatch", "fast"],
    isPopular: true,
    order: 7
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept Credit/Debit Cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) for eligible pin codes.",
    category: "Ordering & Payments",
    keywords: ["payment", "pay", "cod", "cash on delivery", "upi", "card"],
    isPopular: true,
    order: 8
  },
  {
    question: "How can I consult an Ayurvedic expert for pharmacy products?",
    answer: "You can contact our support team at 9561961055 or 9022424266 to schedule a consultation with our experienced Ayurvedic practitioners at Dhangaon.",
    category: "Ayurvedic Pharmacy",
    keywords: ["ayurvedic", "pharmacy", "consult", "doctor", "medicine", "health"],
    isPopular: true,
    order: 9
  },
  {
    question: "What is your return and refund policy?",
    answer: "If you receive damaged, defective, or incorrect items, you can request a return or replacement within 7 days of delivery by contacting customer support.",
    category: "Returns & Support",
    keywords: ["return", "refund", "replace", "damaged", "policy"],
    isPopular: false,
    order: 10
  }
];

// Helper to seed defaults if missing
const ensureDefaultFaqs = async () => {
  for (const faq of DEFAULT_FAQS) {
    const exists = await FAQ.findOne({ question: faq.question });
    if (!exists) {
      await FAQ.create(faq);
    }
  }
};

// 1. Get all FAQs (Public)
export const getFaqs = async (req, res, next) => {
  try {
    await ensureDefaultFaqs();
    const { category, search } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { keywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: faqs.length, faqs });
  } catch (error) {
    next(error);
  }
};

// 2. Create FAQ (Admin)
export const createFaq = async (req, res, next) => {
  try {
    const { question, answer, category, keywords, isPopular, order } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }

    const parsedKeywords = Array.isArray(keywords) 
      ? keywords 
      : (keywords ? keywords.split(',').map(k => k.trim()) : []);

    const faq = await FAQ.create({
      question,
      answer,
      category: category || 'General',
      keywords: parsedKeywords,
      isPopular: Boolean(isPopular),
      order: Number(order) || 0
    });

    res.status(201).json({ success: true, message: 'FAQ created successfully', faq });
  } catch (error) {
    next(error);
  }
};

// 3. Update FAQ (Admin)
export const updateFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, answer, category, keywords, isPopular, order } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    if (question) faq.question = question;
    if (answer) faq.answer = answer;
    if (category) faq.category = category;
    if (isPopular !== undefined) faq.isPopular = Boolean(isPopular);
    if (order !== undefined) faq.order = Number(order);
    if (keywords !== undefined) {
      faq.keywords = Array.isArray(keywords)
        ? keywords
        : keywords.split(',').map(k => k.trim());
    }

    await faq.save();
    res.json({ success: true, message: 'FAQ updated successfully', faq });
  } catch (error) {
    next(error);
  }
};

// 4. Delete FAQ (Admin)
export const deleteFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndDelete(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// 5. Smart AI Chatbot Endpoint (Public)
export const askChatbot = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    await ensureDefaultFaqs();
    const queryText = message.toLowerCase().trim();

    // Fetch all FAQs from DB to evaluate relevance score
    const allFaqs = await FAQ.find();

    let bestMatch = null;
    let highestScore = 0;

    for (const faq of allFaqs) {
      let score = 0;

      // Question match
      const qLower = faq.question.toLowerCase();
      if (qLower.includes(queryText) || queryText.includes(qLower)) {
        score += 10;
      }

      // Word-by-word match score
      const queryWords = queryText.split(/\s+/).filter(w => w.length > 2);
      for (const word of queryWords) {
        if (qLower.includes(word)) score += 3;
        if (faq.answer.toLowerCase().includes(word)) score += 1;
        if (faq.keywords && faq.keywords.some(k => k.toLowerCase().includes(word))) score += 4;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    }

    // Dynamic responses based on context topics if score < 4
    if (highestScore >= 3 && bestMatch) {
      return res.json({
        success: true,
        reply: bestMatch.answer,
        relatedQuestion: bestMatch.question,
        category: bestMatch.category,
        confidence: 'high'
      });
    }

    // Predefined AI Intent Knowledge Rules
    if (queryText.includes('hello') || queryText.includes('hi') || queryText.includes('hey') || queryText.includes('namaste')) {
      return res.json({
        success: true,
        reply: "Namaste! 🙏 Welcome to Arya Malhar Agricultural & Ayurvedic Assistant. How can I help you today? You can ask about our organic produce, Ayurvedic remedies, order delivery, or farm location.",
        confidence: 'high'
      });
    }

    if (queryText.includes('contact') || queryText.includes('phone') || queryText.includes('call') || queryText.includes('number') || queryText.includes('support')) {
      return res.json({
        success: true,
        reply: "You can reach Arya Malhar Customer Support directly at 9561961055 or 9022424266. You can also email us at susanbhosale@gmail.com.",
        confidence: 'high'
      });
    }

    if (queryText.includes('owner') || queryText.includes('founder') || queryText.includes('sunil') || queryText.includes('bhosale')) {
      return res.json({
        success: true,
        reply: "Arya Malhar was founded under the leadership of Shri Sunil Bhosale, recipient of the prestigious Krushibhushan Award for excellence in organic agriculture.",
        confidence: 'high'
      });
    }

    if (queryText.includes('discount') || queryText.includes('offer') || queryText.includes('coupon') || queryText.includes('price')) {
      return res.json({
        success: true,
        reply: "We offer direct farm-to-door pricing with special bundle discounts on bulk orders of organic grains, ghee, and Ayurvedic medicines. Check out our Shop page for active deals!",
        confidence: 'medium'
      });
    }

    // Fallback AI Response
    return res.json({
      success: true,
      reply: "Thank you for asking! Arya Malhar specializes in 100% organic farm produce, Ayurvedic pharmacy formulations, bio-tech agro products, and direct farm delivery from Dhangaon, Sangli. If you have specific inquiry about an order or product, please call our helpline at 9561961055.",
      suggestedQuestions: [
        "Are all products 100% organic?",
        "Where is Arya Malhar Farms located?",
        "How long does delivery take?",
        "How to order Ayurvedic medicines?"
      ],
      confidence: 'low'
    });
  } catch (error) {
    next(error);
  }
};
