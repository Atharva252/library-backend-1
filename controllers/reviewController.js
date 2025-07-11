const Review = require('../models/Review');

exports.addReview = async (req, res) => {
  try {
    const { book, rating, comment } = req.body;
    const user = req.user.id; // Get user from auth middleware
    
    // Check if user already reviewed this book
    const existingReview = await Review.findOne({ user, book });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }
    
    const review = await Review.create({ book, user, rating, comment });
    const populatedReview = await Review.findById(review._id).populate('user', 'name email avatar');
    res.status(201).json({ message: 'Review added successfully', review: populatedReview });
  } catch (err) {
    res.status(400).json({ message: 'Failed to add review', error: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { bookId } = req.query;
    const filter = bookId ? { book: bookId } : {};
    const reviews = await Review.find(filter).populate('user', 'name email avatar').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get reviews', error: err.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Sirf apna review update kar sakta hai
      req.body,
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review updated', review });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update review', error: err.message });
  }
};

// Delete review (already exists in your code)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review', error: err.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await Review.find({ user: userId })
      .populate('book', 'title author coverImage')
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user reviews', error: err.message });
  }
};