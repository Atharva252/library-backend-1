const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/dashboard', adminController.getDashboardStats);
router.post('/users', adminController.manageUsers);

module.exports = router; 