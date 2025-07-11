require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // or your frontend URL
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Download route with proper headers
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  const fs = require('fs');
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }
  
  // Get file stats
  const stats = fs.statSync(filePath);
  
  // Set proper headers for download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', stats.size);
  res.setHeader('Cache-Control', 'no-cache');
  
  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
  
  fileStream.on('error', (error) => {
    console.error('File stream error:', error);
    res.status(500).json({ message: 'Error streaming file' });
  });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', req.body);
  }
  next();
});

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Test uploads directory
app.get('/api/test-uploads', (req, res) => {
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, 'uploads');
  
  try {
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      return res.json({ 
        status: 'Uploads directory created', 
        path: uploadsPath,
        files: [],
        serverUrl: `${req.protocol}://${req.get('host')}`
      });
    }
    
    const files = fs.readdirSync(uploadsPath);
    const fileDetails = files.map(file => {
      const filePath = path.join(uploadsPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        url: `${req.protocol}://${req.get('host')}/uploads/${file}`,
        created: stats.birthtime
      };
    });
    
    res.json({ 
      status: 'Uploads directory exists', 
      path: uploadsPath,
      files: fileDetails,
      count: files.length,
      serverUrl: `${req.protocol}://${req.get('host')}`
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error checking uploads directory', 
      error: error.message 
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use(errorHandler);

// MongoDB connection
const connectDB = require('./config/db');
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});