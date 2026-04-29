import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../store/cartStore.js';

export default function Cart() {
  const { items, removeItem, updateQty, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-700 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-gray-400 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some products to get started!</p>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  const cartTotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const savings = items.reduce((s, i) => s + (i.product.mrp - i.product.price) * i.qty, 0);
  const totalCashback = items.reduce((s, i) => s + Math.floor(i.product.price * i.qty * 0.02), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">
        Shopping <span className="gradient-text">Cart</span>
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map(item => (
              <motion.div
                key={item.product._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="card p-4 flex gap-4"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                  {item.product.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">👗</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm line-clamp-2">{item.product.name}</h3>
                  <p className="text-brand-400 text-xs capitalize mt-0.5">{item.product.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="font-bold text-white">₹{item.product.price.toLocaleString()}</span>
                      <span className="ml-2 text-xs text-gray-500 line-through">₹{item.product.mrp.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-2 py-1">
                        <button onClick={() => updateQty(item.product._id, item.qty - 1)} className="text-gray-400 hover:text-white">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                        <button onClick={() => updateQty(item.product._id, item.qty + 1)} className="text-gray-400 hover:text-white">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.product._id)} className="text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span>You Save</span>
                <span>-₹{savings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-brand-400">
                <span>Monthly Cashback</span>
                <span>₹{totalCashback}/mo</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between text-white font-bold">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full justify-center mt-4">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Cashback teaser */}
          <div className="card p-4 border-green-500/20 bg-green-500/5">
            <p className="text-green-400 text-sm font-medium mb-1">💰 100% Cashback Promise</p>
            <p className="text-gray-400 text-xs">You'll earn ₹{totalCashback}/month for 50 months = ₹{totalCashback * 50} total!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
