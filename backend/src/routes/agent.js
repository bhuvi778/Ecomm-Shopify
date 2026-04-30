import express from 'express';
import { nanoid } from 'nanoid';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';
import { addAgentToPool, getPoolTree } from '../services/poolService.js';

const router = express.Router();

// POST /api/agent/register - Register as sales agent (₹999)
router.post('/register', protect, async (req, res, next) => {
  try {
    if (req.user.isAgent) {
      return res.status(400).json({ message: 'Already registered as agent' });
    }
    const { txnId } = req.body;
    if (!txnId || txnId.trim().length < 4) {
      return res.status(400).json({ message: 'Payment transaction ID is required' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        isAgent: true,
        role: 'agent',
        agentRegisteredAt: new Date(),
        agentFee: 999,
        agentPaymentTxnId: txnId.trim(),
        agentCashbackMonths: 40, // pre-launch offer = 40 months × Rs.100 = Rs.4,000
        agentCashbackPaid: 0,
        $inc: { walletPoints: 1000 }, // welcome voucher for agent
        'welcomeVoucher.amount': 1000,
        'welcomeVoucher.used': 0,
      },
      { new: true }
    );

    // Fee transaction
    await Transaction.create({
      user: user._id,
      type: 'registration_fee',
      points: -999,
      description: 'Sales agent registration fee ₹999',
    });

    // Voucher credit
    await Transaction.create({
      user: user._id,
      type: 'voucher_credit',
      points: 1000,
      description: 'Agent welcome voucher ₹1000',
    });

    res.json({ message: 'Registered as sales agent', user });
  } catch (err) { next(err); }
});

// GET /api/agent/dashboard
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    if (!req.user.isAgent) return res.status(403).json({ message: 'Not an agent' });
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) { next(err); }
});

// POST /api/agent/qualify-pool - Check and add to global pool if qualified
router.post('/qualify-pool', protect, async (req, res, next) => {
  try {
    if (!req.user.isAgent) return res.status(403).json({ message: 'Not an agent' });
    const user = await User.findById(req.user._id);
    if (user.currentMonthSales < 25000) {
      return res.status(400).json({ message: `Need ₹25,000 monthly sales to qualify. Current: ₹${user.currentMonthSales}` });
    }
    const node = await addAgentToPool(user._id);
    res.json({ message: 'Added to Global Pool', node });
  } catch (err) { next(err); }
});

// GET /api/agent/pool
router.get('/pool', protect, async (req, res, next) => {
  try {
    const nodes = await getPoolTree();
    res.json(nodes);
  } catch (err) { next(err); }
});

export default router;
