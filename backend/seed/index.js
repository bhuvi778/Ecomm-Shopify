import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

dotenv.config(); // loads backend/.env (cwd = backend/ when running npm run seed)

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/maalkechalo';

// ─── Inline minimal schemas for seeding ───────────────────────────────────────

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, phone: String,
  password: String, role: { type: String, default: 'customer' },
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  walletPoints: { type: Number, default: 0 },
  welcomeVoucher: { amount: Number, used: Number },
  isAgent: { type: Boolean, default: false },
  agentRegisteredAt: Date, agentFee: Number,
  agentCashbackMonths: { type: Number, default: 30 },
  agentCashbackPaid: { type: Number, default: 0 },
  currentMonthSales: { type: Number, default: 0 },
  inGlobalPool: { type: Boolean, default: false },
  lastRoiApplied: Date, isActive: { type: Boolean, default: true },
  address: { line1: String, city: String, state: String, pincode: String },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true }, description: String,
  category: String, price: Number, mrp: Number,
  images: [String], vendor: String, stock: Number,
  isFeatured: { type: Boolean, default: false },
  rating: Number, reviewCount: Number, tags: [String], isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

const PRODUCTS = [
  // Sarees
  { name: 'Banarasi Silk Saree Gold', category: 'saree', price: 2499, mrp: 3999, description: 'Pure Banarasi silk with zari work, perfect for weddings.', rating: 4.8, reviewCount: 124, isFeatured: true, vendor: 'Surat Textiles Gujarat', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85'], tags: ['silk', 'wedding', 'festive'] },
  { name: 'Chiffon Floral Saree Pink', category: 'saree', price: 899, mrp: 1499, description: 'Light chiffon saree with floral prints, ideal for daily wear.', rating: 4.3, reviewCount: 87, images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=85'], tags: ['chiffon', 'casual', 'floral'], vendor: 'Surat Textiles Gujarat' },
  { name: 'Kanjivaram Silk Saree Red', category: 'saree', price: 3999, mrp: 5999, description: 'Authentic Kanjivaram silk with traditional motifs.', rating: 4.9, reviewCount: 56, isFeatured: true, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4f42?w=600&q=85'], tags: ['silk', 'kanjivaram', 'traditional'], vendor: 'Gujarat Handloom' },
  { name: 'Cotton Printed Saree Blue', category: 'saree', price: 599, mrp: 999, description: 'Comfortable cotton saree for everyday use.', rating: 4.1, reviewCount: 200, images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85'], tags: ['cotton', 'daily', 'printed'], vendor: 'Ahmedabad Mills' },
  { name: 'Georgette Embroidered Saree', category: 'saree', price: 1799, mrp: 2499, description: 'Elegant georgette saree with heavy embroidery.', rating: 4.6, reviewCount: 91, isFeatured: true, images: ['https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=85'], tags: ['georgette', 'embroidery', 'party'], vendor: 'Surat Textiles Gujarat' },

  // Suits
  { name: 'Punjabi Suit Pastel Set', category: 'suit', price: 1299, mrp: 1999, description: 'Beautiful pastel Punjabi suit with dupatta.', rating: 4.5, reviewCount: 143, isFeatured: true, images: ['https://images.unsplash.com/photo-1631233859262-0d9e49c5f1f4?w=600&q=85'], tags: ['punjabi', 'pastel', 'festive'], vendor: 'Gujarat Handloom' },
  { name: 'Anarkali Suit Blue Floral', category: 'suit', price: 1599, mrp: 2299, description: 'Floor-length Anarkali with floral print.', rating: 4.4, reviewCount: 76, images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85'], tags: ['anarkali', 'floral', 'wedding'], vendor: 'Surat Textiles Gujarat' },
  { name: 'Cotton Salwar Kameez White', category: 'suit', price: 799, mrp: 1299, description: 'Pure cotton salwar kameez for daily comfort.', rating: 4.2, reviewCount: 188, images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=85'], tags: ['cotton', 'white', 'casual'], vendor: 'Ahmedabad Mills' },
  { name: 'Embroidered Party Suit Green', category: 'suit', price: 2199, mrp: 3499, description: 'Heavy embroidered suit perfect for parties and events.', rating: 4.7, reviewCount: 55, isFeatured: true, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4f42?w=600&q=85'], tags: ['embroidery', 'party', 'green'], vendor: 'Gujarat Handloom' },

  // Jeans
  { name: 'Slim Fit Denim Jeans Black', category: 'jeans', price: 999, mrp: 1599, description: 'Classic slim fit black jeans for a sleek look.', rating: 4.4, reviewCount: 312, isFeatured: true, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=85'], tags: ['slim', 'black', 'denim'], vendor: 'Denim Factory Surat' },
  { name: 'Straight Cut Blue Jeans', category: 'jeans', price: 899, mrp: 1499, description: 'Comfortable straight cut blue denim jeans.', rating: 4.3, reviewCount: 267, images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=85'], tags: ['straight', 'blue', 'casual'], vendor: 'Denim Factory Surat' },
  { name: 'Skinny Ripped Jeans Grey', category: 'jeans', price: 1199, mrp: 1899, description: 'Trendy ripped skinny jeans in grey shade.', rating: 4.2, reviewCount: 198, images: ['https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600&q=85'], tags: ['skinny', 'ripped', 'trendy'], vendor: 'Denim Factory Surat' },
  { name: 'High Waist Mom Jeans', category: 'jeans', price: 1099, mrp: 1699, description: 'High waist mom jeans with a relaxed fit.', rating: 4.5, reviewCount: 145, isFeatured: true, images: ['https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=85'], tags: ['highwaist', 'mom', 'relaxed'], vendor: 'Denim Factory Surat' },

  // T-Shirts
  { name: 'Plain Round Neck T-Shirt White', category: 'tshirt', price: 299, mrp: 499, description: 'Classic plain white round neck t-shirt, 100% cotton.', rating: 4.3, reviewCount: 520, isFeatured: true, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=85'], tags: ['plain', 'white', 'cotton'], vendor: 'Textile Hub Surat' },
  { name: 'Graphic Print T-Shirt Black', category: 'tshirt', price: 449, mrp: 699, description: 'Stylish graphic print t-shirt for casual wear.', rating: 4.4, reviewCount: 387, images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=85'], tags: ['graphic', 'black', 'casual'], vendor: 'Textile Hub Surat' },
  { name: 'Polo Collar T-Shirt Navy', category: 'tshirt', price: 599, mrp: 899, description: 'Premium polo collar t-shirt for a smart casual look.', rating: 4.6, reviewCount: 234, isFeatured: true, images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=85'], tags: ['polo', 'navy', 'premium'], vendor: 'Textile Hub Surat' },
  { name: 'Oversized T-Shirt Grey', category: 'tshirt', price: 399, mrp: 649, description: 'Trendy oversized t-shirt for a relaxed street look.', rating: 4.2, reviewCount: 298, images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=85'], tags: ['oversized', 'grey', 'streetwear'], vendor: 'Textile Hub Surat' },

  // Kurtas
  { name: 'Cotton Kurta White Embroidered', category: 'kurta', price: 799, mrp: 1299, description: 'Classic white cotton kurta with subtle embroidery.', rating: 4.5, reviewCount: 165, isFeatured: true, images: ['https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&q=85'], tags: ['cotton', 'white', 'ethnic'], vendor: 'Jaipur Craft Gujarat' },
  { name: 'Silk Kurta Cream Party Wear', category: 'kurta', price: 1499, mrp: 2199, description: 'Luxurious silk kurta perfect for parties and occasions.', rating: 4.7, reviewCount: 89, images: ['https://images.unsplash.com/photo-1583846552345-1e864a24c99c?w=600&q=85'], tags: ['silk', 'cream', 'party'], vendor: 'Jaipur Craft Gujarat' },

  // Lehengas
  { name: 'Bridal Lehenga Red Gold', category: 'lehenga', price: 8999, mrp: 14999, description: 'Stunning bridal lehenga with heavy zari embroidery.', rating: 4.9, reviewCount: 43, isFeatured: true, images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85'], tags: ['bridal', 'red', 'wedding'], vendor: 'Gujarat Handloom' },
  { name: 'Lehenga Choli Pink Floral', category: 'lehenga', price: 3499, mrp: 5499, description: 'Beautiful pink floral lehenga for functions and events.', rating: 4.6, reviewCount: 67, images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85'], tags: ['pink', 'floral', 'function'], vendor: 'Gujarat Handloom' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await User.deleteMany({});
  await Product.deleteMany({});
  console.log('Cleared existing data');

  // Hash manually — the inline seed schema has no pre-save hook
  const PLAIN_PW = await bcrypt.hash('Password@123', 10);

  // Create admin
  const admin = await User.create({
    name: 'Admin MaalKeChalo', email: 'admin@maalkechalo.com',
    phone: '9999999999', password: PLAIN_PW, role: 'admin',
    referralCode: 'ADMIN001', walletPoints: 0,
    welcomeVoucher: { amount: 0, used: 0 }, isActive: true,
  });
  console.log('Admin created:', admin.email);

  // Create sample customers
  const customers = [];
  const customerData = [
    { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', city: 'Mumbai', state: 'Maharashtra' },
    { name: 'Priya Singh', email: 'priya@example.com', phone: '9876543211', city: 'Delhi', state: 'Delhi' },
    { name: 'Amit Patel', email: 'amit@example.com', phone: '9876543212', city: 'Surat', state: 'Gujarat' },
    { name: 'Neha Gupta', email: 'neha@example.com', phone: '9876543213', city: 'Bangalore', state: 'Karnataka' },
    { name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '9876543214', city: 'Jaipur', state: 'Rajasthan' },
  ];

  for (const c of customerData) {
    const user = await User.create({
      ...c, password: PLAIN_PW, role: 'customer',
      referralCode: nanoid(8).toUpperCase(),
      referredBy: null, walletPoints: 1000,
      welcomeVoucher: { amount: 1000, used: 0 },
      address: { line1: '123 Main St', city: c.city, state: c.state, pincode: '400001' },
    });
    customers.push(user);
  }
  console.log(`Created ${customers.length} customers`);

  // Create sample agents
  const agentData = [
    { name: 'Vikram Sales Agent', email: 'vikram@example.com', phone: '9876543220', city: 'Ahmedabad', state: 'Gujarat' },
    { name: 'Sweety Agent', email: 'sweety@example.com', phone: '9876543221', city: 'Vadodara', state: 'Gujarat' },
    { name: 'Mohit Distributor', email: 'mohit@example.com', phone: '9876543222', city: 'Surat', state: 'Gujarat' },
  ];
  for (const a of agentData) {
    await User.create({
      ...a, password: PLAIN_PW, role: 'agent',
      referralCode: nanoid(8).toUpperCase(),
      isAgent: true, agentFee: 999, agentCashbackMonths: 30,
      agentCashbackPaid: 2, walletPoints: 1200,
      welcomeVoucher: { amount: 1000, used: 0 },
      currentMonthSales: Math.floor(Math.random() * 30000) + 5000,
    });
  }
  console.log(`Created ${agentData.length} agents`);

  // Create products
  for (const p of PRODUCTS) {
    await Product.create({
      ...p,
      slug: p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + nanoid(5),
      stock: Math.floor(Math.random() * 200) + 20,
    });
  }
  console.log(`Created ${PRODUCTS.length} products`);

  console.log('\n✅ Seed complete!');
  console.log('Admin login: admin@maalkechalo.com / Password@123');
  console.log('Customer login: rahul@example.com / Password@123');
  console.log('Agent login: vikram@example.com / Password@123');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
