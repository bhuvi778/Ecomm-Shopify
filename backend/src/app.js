import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import walletRoutes from './routes/wallet.js';
import referralRoutes from './routes/referral.js';
import agentRoutes from './routes/agent.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

// ── Cached MongoDB connection (module-level, serverless-friendly) ──
let _conn = null;
let _promise = null;

export async function connectDB() {
  if (_conn && mongoose.connection.readyState === 1) return _conn;
  if (!_promise) {
    _promise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    });
  }
  _conn = await _promise;
  return _conn;
}

// ── Express app ──
const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, true); // permissive for now; tighten if needed
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Ensure DB before any /api request
app.use(async (_req, _res, next) => {
  try { await connectDB(); next(); } catch (err) { next(err); }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', project: 'GMT MART' }));

app.use(errorHandler);

export default app;
