const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth'); // Assuming auth middleware exists
const { uploadPDF, handleMulterError } = require('../middleware/upload');
const imageUpload = require('../middleware/imageUpload');

router.get('/', bookController.getBooks);
router.get('/published', bookController.getPublishedBooks);
router.get('/my-books', auth, bookController.getUserBooks);
router.get('/:id', bookController.getBook);
router.post('/', auth, bookController.createBook);
router.post('/upload', auth, uploadPDF.single('pdfFile'), handleMulterError, bookController.createBookWithFile);
router.post('/upload-cover', auth, imageUpload.single('coverImage'), bookController.uploadCoverImage);
router.post('/:id/read', auth, bookController.trackBookRead);
router.put('/:id', auth, bookController.updateBook);
router.delete('/:id', auth, bookController.deleteBook);

module.exports = router; 