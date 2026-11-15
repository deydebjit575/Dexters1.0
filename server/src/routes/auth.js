import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { requireAuth, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, penName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.findOne('users', u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = db.insert('users', {
      name: name.trim(),
      penName: penName?.trim() || name.trim(),
      email: normalizedEmail,
      passwordHash,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      bio: 'New explorer in the StoryVerse. Ready to forge uncharted fictional realms.',
      plan: 'explorer',
      credits: 150,
      maxCredits: 200,
      apiKey: '',
      preferredAIModel: 'auto',
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...safeUser } = newUser;

    res.status(201).json({
      message: 'Account created successfully! Welcome to StoryVerse.',
      user: safeUser,
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error while creating account.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.findOne('users', u => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: 'Logged in successfully.',
      user: safeUser,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Me (Current user profile & stats)
router.get('/me', requireAuth, (req, res) => {
  const user = db.findById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const { passwordHash: _, ...safeUser } = user;
  const universesCount = db.find('universes', u => u.userId === user.id).length;
  const charactersCount = db.find('characters', c => c.userId === user.id).length;
  const storiesCount = db.find('stories', s => s.userId === user.id).length;

  res.json({
    user: safeUser,
    stats: {
      universesCount,
      charactersCount,
      storiesCount,
      credits: safeUser.credits,
      maxCredits: safeUser.maxCredits || 1000,
    }
  });
});

// Update Profile
router.put('/profile', requireAuth, (req, res) => {
  try {
    const { name, penName, bio, avatar, apiKey, preferredAIModel } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (penName !== undefined) updates.penName = penName.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (avatar !== undefined) updates.avatar = avatar.trim();
    if (apiKey !== undefined) updates.apiKey = apiKey.trim();
    if (preferredAIModel !== undefined) updates.preferredAIModel = preferredAIModel;

    const updated = db.update('users', req.user.id, updates);
    const { passwordHash: _, ...safeUser } = updated;
    res.json({ message: 'Profile updated successfully.', user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Forgot Password (simulated recovery)
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const user = db.findOne('users', u => u.email.toLowerCase() === email.trim().toLowerCase());
  // Always return friendly message for security
  res.json({
    message: user
      ? `A password reset link has been dispatched to ${email}. Check your inbox or spam folder.`
      : `If an account with ${email} exists, a password reset link has been dispatched.`
  });
});

// Change Password
router.post('/change-password', requireAuth, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required.' });
    }

    const user = db.findById('users', req.user.id);
    if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);
    db.update('users', user.id, { passwordHash: newHash });

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// Delete account
router.delete('/account', requireAuth, (req, res) => {
  const userId = req.user.id;
  db.delete('users', userId);

  // Clean user-owned records
  ['universes', 'characters', 'locations', 'timelines', 'stories', 'chapters', 'dialogues', 'branchingStories', 'communityPosts'].forEach(col => {
    db.data[col] = db.data[col].filter(item => item.userId !== userId);
  });
  db.save();

  res.json({ message: 'Account and associated projects permanently deleted.' });
});

export default router;
