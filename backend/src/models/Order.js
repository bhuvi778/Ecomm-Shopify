import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  qty: { type: Number, default: 1 },
  image: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 }, // voucher discount
    netAmount: { type: Number, required: true },
    voucherUsed: { type: Number, default: 0 },
    pointsUsed: { type: Number, default: 0 },

    paymentMethod: { type: String, enum: ['COD', 'wallet', 'online'], default: 'COD' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },

    status: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },

    shippingAddress: {
      name: String,
      phone: String,
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },

    cashbackApplied: { type: Boolean, default: false },
    referralCommissionPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'MKC' + Date.now().toString().slice(-8);
  }
  next();
});

export default mongoose.model('Order', orderSchema);
