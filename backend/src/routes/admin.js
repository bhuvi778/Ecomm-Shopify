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

// GET /api/admin/agents/pending — pending agent applications
router.get('/agents/pending', protect, requireRole('admin'), async (_req, res, next) => {
  try {
    const users = await User.find({ agentApprovalStatus: 'pending' })
      .select('-password')
      .sort({ agentRegisteredAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
});

// PUT /api/admin/agents/:id/approve — approve an agent application
router.put('/agents/:id/approve', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.agentApprovalStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending application for this user' });
    }
    user.isAgent = true;
    user.role = 'agent';
    user.agentApprovalStatus = 'approved';
    user.agentApprovedAt = new Date();
    user.agentApprovedBy = req.user._id;
    user.agentRejectionReason = null;
    user.welcomeVoucher = { amount: 1000, used: user.welcomeVoucher?.used || 0 };
    user.walletPoints = (user.walletPoints || 0) + 1000;
    await user.save();

    await Transaction.create({
      user: user._id,
      type: 'registration_fee',
      points: -999,
      description: 'Sales agent registration fee ₹999 (approved)',
    });
    await Transaction.create({
      user: user._id,
      type: 'voucher_credit',
      points: 1000,
      description: 'Agent welcome voucher ₹1000',
    });

    res.json({ message: 'Agent approved and activated', user });
  } catch (err) { next(err); }
});

// PUT /api/admin/agents/:id/reject — reject an agent application
router.put('/agents/:id/reject', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.agentApprovalStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending application for this user' });
    }
    user.agentApprovalStatus = 'rejected';
    user.agentRejectionReason = (reason || '').trim() || 'Application rejected';
    user.isAgent = false;
    await user.save();
    res.json({ message: 'Agent application rejected', user });
  } catch (err) { next(err); }
});

// GET /api/admin/payment-qr — any logged-in user (needed during agent registration)
router.get('/payment-qr', protect, async (_req, res, next) => {
  try {
    const s = await Settings.findOne({ key: 'paymentQR' });
    res.json({
      qr: s?.value?.qr || null,
      label: s?.value?.label || 'UPI / Bank Transfer',
      whatsapp: s?.value?.whatsapp || '',
      whatsappNote: s?.value?.whatsappNote || 'Send the payment screenshot to the WhatsApp number below along with your ID and registered phone number.',
    });
  } catch (err) { next(err); }
});

// PUT /api/admin/payment-qr — admin only
router.put('/payment-qr', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { qr, label, whatsapp, whatsappNote } = req.body;
    const existing = await Settings.findOne({ key: 'paymentQR' });
    const value = {
      qr: qr || existing?.value?.qr || null,
      label: label || existing?.value?.label || 'UPI / Bank Transfer',
      whatsapp: typeof whatsapp === 'string' ? whatsapp : (existing?.value?.whatsapp || ''),
      whatsappNote: typeof whatsappNote === 'string' && whatsappNote.length
        ? whatsappNote
        : (existing?.value?.whatsappNote || 'Send the payment screenshot to the WhatsApp number below along with your ID and registered phone number.'),
    };
    if (!value.qr) return res.status(400).json({ message: 'QR image data required' });
    await Settings.findOneAndUpdate(
      { key: 'paymentQR' },
      { value },
      { upsert: true, new: true }
    );
    res.json({ message: 'Payment settings updated successfully' });
  } catch (err) { next(err); }
});

export default router;
