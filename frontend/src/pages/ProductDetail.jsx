import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, Zap, ArrowLeft, Plus, Minus, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios.js';
import useCartStore from '../store/cartStore.js';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => { setProduct(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-96"><div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const totalCashback = product.price; // 100% over 50 months
  const monthlyCashback = Math.floor(product.price * 0.02);

  const handleAddToCart = () => { addItem(product, qty); toast.success('Added to cart!'); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/shop" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="card overflow-hidden">
          <div className="relative h-96 bg-gradient-to-br from-brand-500/10 to-pink-500/10">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none'; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">👗</div>
            )}
            {discount > 0 && (
              <div className="absolute top-4 left-4 badge bg-green-500 text-white text-sm px-3 py-1">{discount}% OFF</div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-brand-400 font-semibold capitalize mb-2">{product.category}</p>
          <h1 className="font-display text-3xl font-bold text-white mb-3">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-gold-400 fill-gold-400' : 'text-gray-600'}`} />
              ))}
            </div>
            <span className="text-gold-400 font-medium">{product.rating}</span>
            <span className="text-gray-500 text-sm">({product.reviewCount} reviews)</span>
          </div>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-black text-white">₹{product.price.toLocaleString()}</span>
            <span className="text-xl text-gray-500 line-through mb-1">₹{product.mrp.toLocaleString()}</span>
            <span className="badge bg-green-500/20 text-green-400 mb-1">Save ₹{(product.mrp - product.price).toLocaleString()}</span>
          </div>

          {/* Cashback card */}
          <div className="card p-4 mb-6 bg-green-500/5 border-green-500/20">
            <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" /> 100% Cashback Guarantee
            </h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <div className="text-white font-bold text-lg">₹{monthlyCashback}</div>
                <div className="text-gray-400">Per Month</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">50</div>
                <div className="text-gray-400">Months</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">₹{totalCashback.toLocaleString()}</div>
                <div className="text-gray-400">Total Back</div>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mb-6">{product.description}</p>

          {/* Vendor */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
            <Truck className="w-4 h-4 text-brand-400" />
            Sourced from {product.vendor} • Pan India COD Available
          </div>

          {/* Qty + Add to cart */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 card px-3 py-2">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-gray-400 hover:text-white transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="text-gray-400 hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button onClick={handleAddToCart} className="btn-primary flex-1">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
          </div>
          <Link to="/checkout" onClick={handleAddToCart} className="btn-outline w-full justify-center">Buy Now (COD)</Link>
        </div>
      </div>
    </div>
  );
}
