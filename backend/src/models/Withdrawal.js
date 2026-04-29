import mongoose from 'mongoose';

// Withdrawal requests from wallet
const withdrawalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true }, // 1 point = ₹1
    bankName: { type: String },
    accountNumber: { type: String },
    ifsc: { type: String },
    upiId: { type: String },
    status: { type: String, enum: ['pending', 'processed', 'rejected'], default: 'pending' },
    processedAt: { type: Date },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Withdrawal', withdrawalSchema);
