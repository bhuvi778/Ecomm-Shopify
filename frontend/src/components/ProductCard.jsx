import React from 'react';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useCartStore from '../store/cartStore.js';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  saree: 'from-pink-500/20 to-brand-500/20',
  suit: 'from-blue-500/20 to-cyan-500/20',
  jeans: 'from-indigo-500/20 to-blue-600/20',
  tshirt: 'from-green-500/20 to-emerald-500/20',
  kurta: 'from-orange-500/20 to-amber-500/20',
  lehenga: 'from-rose-500/20 to-pink-600/20',
  other: 'from-gray-500/20 to-gray-600/20',
};

export default function ProductCard({ product, onQuickView }) {
  const addItem = useCartStore(s => s.addItem);
  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card overflow-hidden shine-hover group"
    >
      <Link to={`/product/${product._id}`}>
        <div className={`relative h-52 bg-gradient-to-br ${CATEGORY_COLORS[product.category] || CATEGORY_COLORS.other} overflow-hidden`}>
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-30" style={{ display: product.images?.[0] ? 'none' : 'flex' }}>👗</div>
          {discount > 0 && (
            <div className="absolute top-2 left-2 badge bg-green-500/90 text-white">
              {discount}% OFF
            </div>
          )}
          {product.isFeatured && (
            <div className="absolute top-2 right-2 badge bg-gold-500/90 text-black">
              <Zap className="w-3 h-3" /> Featured
            </div>
          )}
          {/* Quick View button — appears on hover */}
          {onQuickView && (
            <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)' }}
            >
              <button
                onClick={e => { e.preventDefault(); onQuickView(product); }}
                className="bg-white text-gray-900 font-semibold text-xs px-4 py-1.5 rounded-full shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-200 hover:bg-brand-600 hover:text-white"
              >
                Quick View
              </button>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <p className="text-xs text-brand-600 uppercase tracking-wider font-semibold mb-1 capitalize">
            {product.category}
          </p>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-2">
          <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
          <span className="text-xs text-gold-400 font-medium">{product.rating}</span>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
            <span className="ml-2 text-xs text-gray-500 line-through">₹{product.mrp.toLocaleString()}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="p-2 rounded-xl bg-brand-100 text-brand-600 hover:bg-brand-600 hover:text-white transition-all duration-200 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Cashback hint */}
        <div className="mt-2 text-xs text-green-600 font-medium">
          💰 Earn ₹{Math.floor(product.price * 0.02)}/mo cashback
        </div>
      </div>
    </motion.div>
  );
}
