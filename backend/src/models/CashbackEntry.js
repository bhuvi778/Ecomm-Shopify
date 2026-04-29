import mongoose from 'mongoose';

// Tracks monthly 2% cashback per order over 50 months
const cashbackEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    orderAmount: { type: Number, required: true },
    // 2% per month × 50 months = 100% returned
    monthlyRate: { type: Number, default: 0.02 },
    totalMonths: { type: Number, default: 50 },
    paidMonths: { type: Number, default: 0 },
    nextPayDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('CashbackEntry', cashbackEntrySchema);
