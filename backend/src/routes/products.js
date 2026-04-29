import express from 'express';
import Product from '../models/Product.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/products?category=&search=&page=&limit=&sort=&minPrice=&maxPrice=&minRating=&minDiscount=&inStock=
router.get('/', async (req, res, next) => {
  try {
    const {
      category, search, featured,
      page = 1, limit = 20,
      sort,
      minPrice, maxPrice,
      minRating, minDiscount,
      inStock,
    } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.name = { $regex: search, $options: 'i' };

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Minimum rating
    if (minRating) query.rating = { $gte: Number(minRating) };

    // In stock only
    if (inStock === 'true') query.stock = { $gt: 0 };

    // Minimum discount % — uses $expr to compute (mrp-price)/mrp*100
    if (minDiscount) {
      query.$expr = {
        $gte: [
          { $multiply: [{ $divide: [{ $subtract: ['$mrp', '$price'] }, '$mrp'] }, 100] },
          Number(minDiscount),
        ],
      };
    }

    // Sort
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc')  sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'newest')     sortObj = { createdAt: -1 };
    else if (sort === 'rating')     sortObj = { rating: -1, reviewCount: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort(sortObj);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// GET /api/products/categories
router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json(categories);
  } catch (err) { next(err); }
});

// GET /api/products/:idOrSlug
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [{ _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null }, { slug: req.params.id }],
      isActive: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
});

// POST /api/products (admin only)
router.post('/', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) { next(err); }
});

// PUT /api/products/:id (admin only)
router.put('/:id', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) { next(err); }
});

// DELETE /api/products/:id (admin only)
router.delete('/:id', protect, requireRole('admin'), async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Product deactivated' });
  } catch (err) { next(err); }
});

export default router;
