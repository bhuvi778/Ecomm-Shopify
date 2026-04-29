import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'cashback',        // monthly 2% cashback
        'referral',        // referral commission
        'agent_cashback',  // agent monthly 10% cashback
        'roi',             // 5% monthly ROI on wallet balance
        'voucher_credit',  // welcome voucher
        'purchase_debit',  // used points for purchase
        'withdrawal',      // withdrawal request
        'registration_fee',// agent registration fee paid
      ],
      required: true,
    },
    points: { type: Number, required: true }, // positive = credit, negative = debit
    description: { type: String },
    reference: { type: mongoose.Schema.Types.ObjectId, refPath: 'refModel' },
    refModel: { type: String, enum: ['Order', 'User'] },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
