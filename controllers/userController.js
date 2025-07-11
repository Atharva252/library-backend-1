const User = require('../models/User');
const path = require('path');
const fs = require('fs');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get users', error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update user', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'email'];
    const updates = {};
    
    // Only allow specific fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true, select: '-password' }
    );
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update profile', error: err.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No avatar file uploaded' });
    }

    // Create avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Update user's avatar
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true, runValidators: true, select: '-password' }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Avatar updated successfully', 
      user,
      avatarUrl 
    });
  } catch (err) {
    res.status(400).json({ message: 'Failed to upload avatar', error: err.message });
  }
};

exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar file if it exists and is not a default avatar
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldAvatarPath = path.join(__dirname, '..', 'uploads', 'avatars', path.basename(user.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Reset to default avatar
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: 'https://i.pravatar.cc/80?img=8' },
      { new: true, runValidators: true, select: '-password' }
    );

    res.json({ 
      message: 'Avatar deleted successfully', 
      user: updatedUser 
    });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete avatar', error: err.message });
  }
};