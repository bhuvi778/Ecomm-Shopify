import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Withdrawal from '../models/Withdrawal.js';
import CashbackEntry from '../models/CashbackEntry.js';
import { protect } from '../middleware/auth.js';
import { processDueCashbacks, applyWalletRoi } from '../services/cashbackService.js';

const router = express.Router();

// GET /api/wallet/balance
router.get('/balance', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('walletPoints welcomeVoucher');
    res.json({ points: user.walletPoints, voucherBalance: user.welcomeVoucher });
  } catch (err) { next(err); }
});

// GET /api/wallet/transactions
router.get('/transactions', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const txns = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(txns);
  } catch (err) { next(err); }
});

// GET /api/wallet/cashback-schedule
router.get('/cashback-schedule', protect, async (req, res, next) => {
  try {
    const entries = await CashbackEntry.find({ user: req.user._id })
      .populate('order', 'orderNumber netAmount createdAt')
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) { next(err); }
});

// POST /api/wallet/withdraw
router.post('/withdraw', protect, async (req, res, next) => {
  try {
    const { points, bankName, accountNumber, ifsc, upiId } = req.body;
    if (!points || points < 100) {
      return res.status(400).json({ message: 'Minimum withdrawal is 100 points (₹100)' });
    }
    const user = await User.findById(req.user._id);
    if (user.walletPoints < points) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    user.walletPoints -= points;
    await user.save();

    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      points,
      bankName,
      accountNumber,
      ifsc,
      upiId,
    });

    await Transaction.create({
      user: req.user._id,
      type: 'withdrawal',
      points: -points,
      description: `Withdrawal request ₹${points}`,
      reference: withdrawal._id,
      refModel: 'User',
    });

    res.status(201).json({ message: 'Withdrawal request placed', withdrawal });
  } catch (err) { next(err); }
});

// GET /api/wallet/withdrawals
router.get('/withdrawals', protect, async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) { next(err); }
});

// POST /api/wallet/process-cashbacks (admin trigger or cron)
router.post('/process-cashbacks', protect, async (req, res, next) => {
  try {
    const count = await processDueCashbacks();
    res.json({ message: `Processed ${count} cashback entries` });
  } catch (err) { next(err); }
});

// POST /api/wallet/apply-roi (admin trigger)
router.post('/apply-roi', protect, async (req, res, next) => {
  try {
    const count = await applyWalletRoi();
    res.json({ message: `Applied ROI to ${count} users` });
  } catch (err) { next(err); }
});

export default router;
