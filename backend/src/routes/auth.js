import express from 'express';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, password, referralCode } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      referralCode: nanoid(8).toUpperCase(),
      referredBy: referrer?._id || null,
      // ₹1000 welcome voucher
      welcomeVoucher: { amount: 1000, used: 0 },
    });

    // Credit welcome voucher as transaction record
    await Transaction.create({
      user: user._id,
      type: 'voucher_credit',
      points: 1000,
      description: 'Welcome ₹1000 voucher credited on registration',
    });

    // Also put 1000 points in wallet as voucher balance
    user.walletPoints = 1000;
    await user.save();

    res.status(201).json({ token: signToken(user._id), user: sanitize(user) });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Block login while agent application is pending or rejected (admins always allowed)
    if (user.role !== 'admin') {
      if (user.agentApprovalStatus === 'pending') {
        return res.status(403).json({
          message: 'Your sales-agent application is pending admin approval. You will be able to log in once approved.',
          approvalStatus: 'pending',
        });
      }
      if (user.agentApprovalStatus === 'rejected') {
        return res.status(403).json({
          message: `Your sales-agent application was rejected${user.agentRejectionReason ? ': ' + user.agentRejectionReason : '.'} Please contact admin.`,
          approvalStatus: 'rejected',
        });
      }
    }
    res.json({ token: signToken(user._id), user: sanitize(user) });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(sanitize(req.user));
});

// PUT /api/auth/address
router.put('/address', protect, async (req, res, next) => {
  try {
    const { line1, city, state, pincode } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { address: { line1, city, state, pincode } },
      { new: true }
    );
    res.json(sanitize(user));
  } catch (err) { next(err); }
});

// GET /api/auth/referrer?code=XXXXX  — public: returns agent name for referral banner
router.get('/referrer', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: 'code required' });
    const user = await User.findOne({ referralCode: code.toUpperCase() }).select('name isAgent role');
    if (!user) return res.status(404).json({ message: 'Referral code not found' });
    res.json({ name: user.name, isAgent: user.isAgent, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

function sanitize(user) {
  const u = user.toObject ? user.toObject() : user;
  delete u.password;
  return u;
}

export default router;
