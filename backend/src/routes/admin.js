import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Withdrawal from '../models/Withdrawal.js';
import Transaction from '../models/Transaction.js';
import Settings from '../models/Settings.js';
import { protect, requireRole } from '../middleware/auth.js';
import { processAgentCashbacks } from '../services/cashbackService.js';

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', protect, requireRole('admin'), async (_req, res, next) => {
  try {
    const [totalUsers, totalAgents, totalOrders, totalRevenue, pendingWithdrawals] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ isAgent: true }),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$netAmount' } } }]),
      Withdrawal.countDocuments({ status: 'pending' }),
    ]);
    res.json({
      totalUsers,
      totalAgents,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingWithdrawals,
    });
  } catch (err) { next(err); }
});

// GET /api/admin/users
router.get('/users', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 30, role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (err) { next(err); }
});

// GET /api/admin/withdrawals
router.get('/withdrawals', protect, requireRole('admin'), async (_req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) { next(err); }
});

// PUT /api/admin/withdrawals/:id
router.put('/withdrawals/:id', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const w = await Withdrawal.findByIdAndUpdate(
      req.params.id,
      { status, note, processedAt: new Date() },
      { new: true }
    );
    res.json(w);
  } catch (err) { next(err); }
});

// POST /api/admin/run-agent-cashbacks
router.post('/run-agent-cashbacks', protect, requireRole('admin'), async (_req, res, next) => {
  try {
    const count = await processAgentCashbacks();
    res.json({ message: `Processed agent cashbacks for ${count} agents` });
  } catch (err) { next(err); }
});

// GET /api/admin/payment-qr — any logged-in user (needed during agent registration)
router.get('/payment-qr', protect, async (_req, res, next) => {
  try {
    const s = await Settings.findOne({ key: 'paymentQR' });
    res.json({ qr: s?.value?.qr || null, label: s?.value?.label || 'JazzCash / EasyPaisa' });
  } catch (err) { next(err); }
});

// PUT /api/admin/payment-qr — admin only
router.put('/payment-qr', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { qr, label } = req.body;
    if (!qr) return res.status(400).json({ message: 'QR image data required' });
    await Settings.findOneAndUpdate(
      { key: 'paymentQR' },
      { value: { qr, label: label || 'JazzCash / EasyPaisa' } },
      { upsert: true, new: true }
    );
    res.json({ message: 'Payment QR updated successfully' });
  } catch (err) { next(err); }
});

export default router;
