import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, ChevronDown, ChevronUp, RefreshCw, MessageSquare
} from 'lucide-react';
import api from '../services/api';

const INITIAL_FAQS = [
  {
    _id: '1',
    question: "How do you guarantee the products are 100% organic?",
    answer: "Every batch undergoes testing and holds organic certifications under standard Indian NPOP inspection boards. Traceability links on our batch invoices specify grower origin."
  },
  {
    _id: '2',
    question: "What is the Krushibhushan connection?",
    answer: "Our founder Sunil Bhosale won the prestigious state award for showing that organic models yield higher crop outputs when soil inputs are bio-composted correctly. He manages our guidelines."
  },
  {
    _id: '3',
    question: "Do you ship outside Pune and Mumbai?",
    answer: "Currently, fresh vegetables are delivered only inside Pune and Mumbai to prevent spoilage. Dry grains, flour, vermicompost, and powders are shipped pan-India."
  },
  {
    _id: '4',
    question: "How does cash on delivery work?",
    answer: "Simply select Cash on Delivery during checkout. Our delivery executives will collect the payment via cash or local UPI QR scanner at your doorstep."
  },
  {
    _id: '5',
    question: "Are all Arya Malhar products 100% certified organic?",
    answer: "Yes, 100%! All our agricultural produce, grains, pulses, fruits, and Ayurvedic products are grown using pure organic and natural farming techniques without synthetic chemicals or pesticides."
  },
  {
    _id: '6',
    question: "Where is Arya Malhar Farms located?",
    answer: "Arya Malhar Ayurvedic Pharmacy & Farms is located at Gat No. 163/351 A/p. Dhangaon, Tal. Palus, Dist. Sangli 416303, Maharashtra."
  },
  {
    _id: '7',
    question: "How long does shipping & delivery take?",
    answer: "Standard delivery across Maharashtra takes 2 to 4 business days. For express orders within Sangli, Satara, and Kolhapur districts, delivery is usually completed within 24 to 48 hours."
  },
  {
    _id: '8',
    question: "What payment methods are accepted?",
    answer: "We accept Credit/Debit Cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) for eligible pin codes."
  },
  {
    _id: '9',
    question: "How can I consult an Ayurvedic expert for pharmacy products?",
    answer: "You can contact our support team at 9561961055 or 9022424266 to schedule a consultation with our experienced Ayurvedic practitioners at Dhangaon."
  },
  {
    _id: '10',
    question: "What is your return and refund policy?",
    answer: "If you receive damaged, defective, or incorrect items, you can request a return or replacement within 7 days of delivery by contacting customer support."
  }
];

const FAQ = () => {
  const [faqs, setFaqs] = useState(INITIAL_FAQS);
  const [loading, setLoading] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await api.get('/faqs');
      if (res.faqs && res.faqs.length > 0) {
        setFaqs(res.faqs);
      }
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    }
  };

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-earth-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-earth-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Frequently Asked Questions
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-earth-600 text-sm font-medium">Loading FAQs...</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-earth-200">
              <HelpCircle className="h-10 w-10 text-earth-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-earth-800">No FAQs available</h3>
              <p className="text-xs text-earth-500 mt-1">Use our AI Chatbot above to ask any question!</p>
            </div>
          ) : (
            faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq._id || index}
                  className="bg-white rounded-2xl border border-earth-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full p-5 text-left flex items-center justify-between space-x-4 focus:outline-none"
                  >
                    <span className="font-bold text-earth-900 text-sm sm:text-base">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-earth-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-earth-700 text-xs sm:text-sm leading-relaxed border-t border-earth-100 bg-earth-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Support Footer Card */}
        <div className="bg-primary-dark text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-white">Still have questions?</h3>
            <p className="text-earth-300 text-xs sm:text-sm mt-1">
              Call our support helpline at <span className="text-secondary font-bold">9561961055 / 9022424266</span> or visit our farm at Dhangaon, Sangli.
            </p>
          </div>
          <a
            href="tel:9561961055"
            className="bg-secondary hover:bg-secondary-dark text-earth-900 px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all shadow-md whitespace-nowrap"
          >
            Call Support Now
          </a>
        </div>

      </div>
    </div>
  );
};

export default FAQ;
