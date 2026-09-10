import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isMongoConnected } from '../config/db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'alpha_investing_jwt_secret_key_2026';

const inMemoryUsers = new Map();

const generateToken = (id, email, name) => {
  return jwt.sign({ id, email, name }, JWT_SECRET, { expiresIn: '7d' });
};

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, riskTolerance = 'moderate' } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isMongoConnected) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: normalizedEmail,
        passwordHash,
        riskTolerance,
      });

      const token = generateToken(user._id.toString(), user.email, user.name);
      res.status(201).json({
        message: 'Account created successfully',
        token,
        user: { id: user._id.toString(), name: user.name, email: user.email, riskTolerance: user.riskTolerance },
      });
    } else {
      if (inMemoryUsers.has(normalizedEmail)) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const id = 'mem_' + Date.now();
      const newUser = { id, name, email: normalizedEmail, passwordHash, riskTolerance };
      inMemoryUsers.set(normalizedEmail, newUser);

      const token = generateToken(id, normalizedEmail, name);
      res.status(201).json({
        message: 'Account created successfully (In-Memory mode)',
        token,
        user: { id, name, email: normalizedEmail, riskTolerance },
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Signup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isMongoConnected) {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const token = generateToken(user._id.toString(), user.email, user.name);
      res.json({
        message: 'Logged in successfully',
        token,
        user: { id: user._id.toString(), name: user.name, email: user.email, riskTolerance: user.riskTolerance },
      });
    } else {
      const user = inMemoryUsers.get(normalizedEmail);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const token = generateToken(user.id, user.email, user.name);
      res.json({
        message: 'Logged in successfully (In-Memory mode)',
        token,
        user: { id: user.id, name: user.name, email: user.email, riskTolerance: user.riskTolerance },
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Get Current User Profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
