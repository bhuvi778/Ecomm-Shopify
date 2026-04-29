import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['customer', 'agent', 'admin'], default: 'customer' },

    // Referral
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referralLevel: { type: Number, default: 0 }, // 0 = root

    // Wallet
    walletPoints: { type: Number, default: 0 },  // 1 point = ₹1
    lastRoiApplied: { type: Date, default: null }, // for 5% monthly ROI

    // Welcome voucher
    welcomeVoucher: {
      amount: { type: Number, default: 0 },
      used: { type: Number, default: 0 },
    },

    // Agent specific
    isAgent: { type: Boolean, default: false },
    agentRegisteredAt: { type: Date },
    agentFee: { type: Number, default: 0 }, // amount paid (999)
    agentPaymentTxnId: { type: String, default: null }, // payment transaction ID proof
    agentCashbackMonths: { type: Number, default: 30 }, // pre-launch = 30
    agentCashbackPaid: { type: Number, default: 0 }, // months paid so far

    // Monthly sales for global pool qualification
    currentMonthSales: { type: Number, default: 0 },
    inGlobalPool: { type: Boolean, default: false },

    // Address
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
