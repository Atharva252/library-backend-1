const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', reviewController.getReviews);

// Protected routes (require authentication)
router.post('/', authMiddleware, reviewController.addReview);
router.put('/:id', authMiddleware, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewController.deleteReview);
router.get('/user/my-reviews', authMiddleware, reviewController.getUserReviews);

module.exports = router;