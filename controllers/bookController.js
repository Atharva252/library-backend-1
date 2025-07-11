const Book = require('../models/Book');

exports.createBook = async (req, res) => {
  try {
    console.log('Creating book with data:', req.body);
    console.log('User from auth middleware:', req.user);
    
    const bookData = {
      ...req.body,
      uploadedBy: req.user.id // Assuming user is attached to request via auth middleware
    };
    
    console.log('Final book data:', bookData);
    
    const book = await Book.create(bookData);
    console.log('Book created successfully:', book);
    
    const populatedBook = await Book.findById(book._id).populate('uploadedBy', 'name email');
    console.log('Populated book:', populatedBook);
    
    res.status(201).json(populatedBook);
  } catch (err) {
    console.error('Error creating book:', err);
    res.status(400).json({ message: err.message });
  }
};

// Create book with file upload
exports.createBookWithFile = async (req, res) => {
  try {
    console.log('Creating book with file upload');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    console.log('User from auth middleware:', req.user);
    
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }
    
    // Create the PDF file URL
    const pdfFileUrl = `uploads/${req.file.filename}`;
    
    const bookData = {
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      category: req.body.category,
      coverImage: req.body.coverImage,
      pdfFile: pdfFileUrl,
      uploadedBy: req.user.id
    };
    
    console.log('Final book data with file:', bookData);
    
    const book = await Book.create(bookData);
    console.log('Book created successfully with file:', book);
    
    const populatedBook = await Book.findById(book._id).populate('uploadedBy', 'name email');
    console.log('Populated book with file:', populatedBook);
    
    res.status(201).json(populatedBook);
  } catch (err) {
    console.error('Error creating book with file:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    // Only return published and available books for public viewing
    const books = await Book.find({ 
      published: true, 
      available: true 
    }).populate('uploadedBy', 'name email');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserBooks = async (req, res) => {
  try {
    const books = await Book.find({ uploadedBy: req.user.id }).populate('uploadedBy', 'name email');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    console.log('Updating book with ID:', req.params.id);
    console.log('Update data:', req.body);
    console.log('User from auth middleware:', req.user);
    
    // First, find the book to check ownership
    const existingBook = await Book.findById(req.params.id);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if the user owns this book
    if (existingBook.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own books' });
    }
    
    // Prepare update data - only allow certain fields to be updated
    const allowedUpdates = ['title', 'author', 'description', 'category', 'coverImage', 'available', 'published'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    console.log('Filtered update data:', updateData);
    
    // Update the book
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name email');
    
    console.log('Book updated successfully:', updatedBook);
    res.json(updatedBook);
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Track when a user reads a book
exports.trackBookRead = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    
    // Check if book is published and available
    if (!book.published || !book.available) {
      return res.status(403).json({ message: 'Book is not available for reading' });
    }
    
    // Increment read count
    book.readCount += 1;
    await book.save();
    
    res.json({ 
      message: 'Book read tracked successfully',
      readCount: book.readCount,
      book: {
        id: book._id,
        title: book.title,
        author: book.author,
        pdfFile: book.pdfFile
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get published books with reading statistics
exports.getPublishedBooks = async (req, res) => {
  try {
    const books = await Book.find({ 
      published: true, 
      available: true 
    })
    .populate('uploadedBy', 'name email')
    .sort({ publishedAt: -1 }); // Sort by most recently published
    
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload cover image
exports.uploadCoverImage = async (req, res) => {
  try {
    console.log('Uploading cover image');
    console.log('Uploaded file:', req.file);
    console.log('User from auth middleware:', req.user);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }
    
    // Create the image file URL
    const imageUrl = `uploads/${req.file.filename}`;
    
    console.log('Cover image uploaded successfully:', imageUrl);
    
    res.status(201).json({ 
      message: 'Cover image uploaded successfully',
      imageUrl: imageUrl,
      fullUrl: `${req.protocol}://${req.get('host')}/${imageUrl}`
    });
  } catch (err) {
    console.error('Error uploading cover image:', err);
    res.status(400).json({ message: err.message });
  }
};