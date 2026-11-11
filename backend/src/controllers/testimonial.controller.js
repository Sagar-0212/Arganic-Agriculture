import Testimonial from '../models/testimonial.model.js';

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return res.json({ success: true, testimonials });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Create new testimonial
// @route   POST /api/admin/testimonials
// @access  Private/Admin
export const createTestimonial = async (req, res) => {
  const { name, quote, rating, role, photo } = req.body;
  try {
    const testimonial = await Testimonial.create({ name, quote, rating, role, photo });
    return res.status(201).json({ success: true, message: 'Testimonial created successfully', testimonial });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Delete testimonial
// @route   DELETE /api/admin/testimonials/:id
// @access  Private/Admin
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    await Testimonial.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
