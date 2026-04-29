import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String },
    category: {
      type: String,
      required: true,
      enum: ['saree', 'suit', 'jeans', 'tshirt', 'kurta', 'lehenga', 'other'],
    },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    images: [{ type: String }],
    vendor: { type: String, default: 'Gujarat Vendor' },
    stock: { type: Number, default: 100 },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 4.0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    tags: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now();
  }
  next();
});

export default mongoose.model('Product', productSchema);
