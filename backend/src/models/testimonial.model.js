import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quote: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String,
    default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop'
  }
}, {
  timestamps: true
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;
