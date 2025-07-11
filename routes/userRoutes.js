const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { uploadAvatar, handleMulterError } = require('../middleware/upload');

// Public routes
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);

// Protected routes (require authentication)
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.post('/avatar', auth, uploadAvatar, handleMulterError, userController.uploadAvatar);
router.delete('/avatar', auth, userController.deleteAvatar);

// Admin routes
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router; 