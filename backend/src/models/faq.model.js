import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: 'General',
      enum: ['General', 'Products & Organic', 'Ordering & Payments', 'Shipping & Delivery', 'Ayurvedic Pharmacy', 'Returns & Support'],
    },
    keywords: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    isPopular: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

faqSchema.index({ question: 'text', answer: 'text', keywords: 'text' });

const FAQ = mongoose.model('FAQ', faqSchema);
export default FAQ;
