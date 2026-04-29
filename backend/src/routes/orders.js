import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect, requireRole } from '../middleware/auth.js';
import { distributeReferralCommission, createCashbackSchedule } from '../services/cashbackService.js';

const router = express.Router();

// POST /api/orders  - Place order (COD)
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shippingAddress, pointsToUse = 0, paymentMethod = 'COD' } = req.body;
    if (!items?.length || !shippingAddress) {
      return res.status(400).json({ message: 'Items and shipping address required' });
    }

    // Build order items with current prices
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product ${item.product} not found` });
      orderItems.push({ product: product._id, name: product.name, price: product.price, qty: item.qty || 1, image: product.images[0] });
      totalAmount += product.price * (item.qty || 1);
    }

    const user = await User.findById(req.user._id);

    // Voucher: 20% discount auto-applied from welcome voucher
    let discountAmount = 0;
    if (user.welcomeVoucher && user.welcomeVoucher.amount > user.welcomeVoucher.used) {
      const remaining = user.welcomeVoucher.amount - user.welcomeVoucher.used;
      const voucherDiscount = Math.min(Math.floor(totalAmount * 0.20), remaining);
      discountAmount = voucherDiscount;
      user.welcomeVoucher.used += voucherDiscount;
    }

    // Points usage
    const usedPoints = Math.min(pointsToUse, user.walletPoints);
    const netAmount = Math.max(0, totalAmount - discountAmount - usedPoints);

    user.walletPoints -= usedPoints;
    user.currentMonthSales = (user.currentMonthSales || 0) + netAmount;
    await user.save();

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      discountAmount,
      voucherUsed: discountAmount,
      pointsUsed: usedPoints,
      netAmount,
      paymentMethod,
      shippingAddress,
    });

    // Referral commissions
    await distributeReferralCommission(req.user._id, order._id, netAmount);
    order.referralCommissionPaid = true;

    // Cashback schedule
    await createCashbackSchedule(req.user._id, order._id, netAmount);
    order.cashbackApplied = true;

    await order.save();

    res.status(201).json(order);
  } catch (err) { next(err); }
});

// GET /api/orders/my - My orders
router.get('/my', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images category')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your order' });
    }
    res.json(order);
  } catch (err) { next(err); }
});

// PUT /api/orders/:id/status (admin)
router.put('/:id/status', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (err) { next(err); }
});

// GET /api/orders (admin)
router.get('/', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ orders, total });
  } catch (err) { next(err); }
});

export default router;
