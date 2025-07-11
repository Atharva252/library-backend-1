const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Temporary hardcoded URL for testing
    const mongoURL = 'mongodb+srv://atharvabhintade:library123@cluster0.imq33su.mongodb.net/library_management';
    
    console.log('Attempting to connect to MongoDB...');
    console.log('Using URL:', mongoURL);
    
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;