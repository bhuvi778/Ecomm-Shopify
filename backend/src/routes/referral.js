import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/referral/my-link
router.get('/my-link', protect, async (req, res) => {
  res.json({
    referralCode: req.user.referralCode,
    referralLink: `${process.env.CLIENT_ORIGIN}/register?ref=${req.user.referralCode}`,
  });
});

// GET /api/referral/my-network
router.get('/my-network', protect, async (req, res, next) => {
  try {
    const level1 = await User.find({ referredBy: req.user._id }).select('name email createdAt role isAgent');
    const level1Ids = level1.map(u => u._id);
    const level2 = await User.find({ referredBy: { $in: level1Ids } }).select('name email createdAt role');
    const level2Ids = level2.map(u => u._id);
    const level3 = await User.find({ referredBy: { $in: level2Ids } }).select('name email createdAt role');
    const level3Ids = level3.map(u => u._id);
    const level4 = await User.find({ referredBy: { $in: level3Ids } }).select('name email createdAt role');
    const level4Ids = level4.map(u => u._id);
    const level5 = await User.find({ referredBy: { $in: level4Ids } }).select('name email createdAt role');

    res.json({ level1, level2, level3, level4, level5 });
  } catch (err) { next(err); }
});

// GET /api/referral/earnings
router.get('/earnings', protect, async (req, res, next) => {
  try {
    const txns = await Transaction.find({ user: req.user._id, type: 'referral' }).sort({ createdAt: -1 });
    const total = txns.reduce((sum, t) => sum + t.points, 0);
    res.json({ total, transactions: txns });
  } catch (err) { next(err); }
});

export default router;
