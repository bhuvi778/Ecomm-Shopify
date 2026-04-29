// Local dev entry — Vercel uses api/index.js instead.
import dotenv from 'dotenv';
dotenv.config();

import app, { connectDB } from './app.js';

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`GMT MART server running on port ${PORT}`)))
  .catch(err => { console.error('Startup error:', err); process.exit(1); });
