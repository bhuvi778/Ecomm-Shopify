import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingCart, Zap, CheckCircle, Truck, ArrowRight, Tag, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore.js';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  saree:   'from-pink-400/25 to-brand-400/25',
  suit:    'from-blue-400/25 to-cyan-400/25',
  jeans:   'from-indigo-400/25 to-blue-500/25',
  tshirt:  'from-green-400/25 to-emerald-400/25',
  kurta:   'from-orange-400/25 to-amber-400/25',
  lehenga: 'from-rose-400/25 to-pink-500/25',
  other:   'from-gray-400/25 to-gray-500/25',
};

export default function ProductModal({ product, onClose }) {
  const addItem = useCartStore(s => s.addItem);
  if (!product) return null;

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const cashbackMonthly = Math.floor(product.price * 0.02);

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
    onClose();
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col sm:flex-row max-h-[90vh] overflow-y-auto">

            {/* Image panel */}
            <div className={`relative sm:w-60 h-60 sm:h-auto flex-shrink-0 bg-gradient-to-br ${CATEGORY_COLORS[product.category] || CATEGORY_COLORS.other} flex items-center justify-center`}>
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="text-8xl opacity-20">👗</div>
              )}
              {discount > 0 && (
                <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                  {discount}% OFF
                </div>
              )}
              {product.isFeatured && (
                <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full">
                  ⚡ Featured
                </div>
              )}
            </div>

            {/* Details panel */}
            <div className="flex-1 p-6 flex flex-col">
              {/* Top row: category + close */}
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs text-brand-600 font-bold uppercase tracking-wider capitalize">{product.category}</span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-gray-100 transition -mt-1 -mr-1 flex-shrink-0"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Product name */}
              <h2 className="font-display font-black text-xl text-gray-900 leading-snug mb-2">{product.name}</h2>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
                <span className="text-xs text-gray-500 ml-1">{product.rating} · {product.reviewCount} reviews</span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{product.description}</p>
              )}

              {/* Price row */}
              <div className="flex items-baseline gap-2.5 mb-4">
                <span className="text-3xl font-black text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.mrp > product.price && (
                  <span className="text-base text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
                )}
                {discount > 0 && (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    Save ₹{(product.mrp - product.price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Cashback card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-3 mb-4">
                <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                  <Zap className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ₹{cashbackMonthly}/month × 50 months cashback
                </div>
                <p className="text-xs text-green-600 mt-0.5 ml-6">= ₹{product.price.toLocaleString()} back — your full purchase price returned!</p>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
                  <Truck className="w-3 h-3 text-brand-500" /> Free COD
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
                  <Package className="w-3 h-3 text-green-500" /> In Stock ({product.stock})
                </span>
                {product.vendor && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
                    <Tag className="w-3 h-3 text-blue-500" /> {product.vendor}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
                <Link
                  to={`/product/${product._id}`}
                  onClick={onClose}
                  className="flex items-center gap-1 px-4 py-3 rounded-xl border-2 border-brand-600 text-brand-600 font-semibold text-sm hover:bg-brand-50 transition whitespace-nowrap"
                >
                  Full Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
