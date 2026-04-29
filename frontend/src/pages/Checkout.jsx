import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, CreditCard, Wallet, ArrowLeft, CheckCircle } from 'lucide-react';
import useCartStore from '../store/cartStore.js';
import useAuthStore from '../store/authStore.js';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [usePoints, setUsePoints] = useState(false);
  const [addr, setAddr] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    line1: user?.address?.line1 || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const voucherMax = user?.welcomeVoucher ? Math.min(user.welcomeVoucher.amount - (user.welcomeVoucher.used || 0), Math.floor(subtotal * 0.10)) : 0;
  const pointsDiscount = usePoints ? Math.min(user?.walletPoints || 0, subtotal * 0.20) : 0;
  const total = Math.max(0, subtotal - voucherMax - pointsDiscount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) return toast.error('Cart is empty');
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map(i => ({ product: i.product._id, qty: i.qty })),
        shippingAddress: addr,
        pointsToUse: usePoints ? Math.floor(pointsDiscount) : 0,
        paymentMethod: 'COD',
      });
      clearCart();
      await refreshUser();
      setPlaced(data);
      toast.success('Order placed! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (placed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
        </motion.div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Order Placed! 🎉</h1>
        <p className="text-gray-400 mb-2">Order #{placed.orderNumber}</p>
        <p className="text-green-400 mb-8">Cashback of ₹{Math.floor(placed.netAmount * 0.02)}/month for 50 months starts now!</p>
        <div className="flex gap-4 justify-center">
          <Link to="/orders" className="btn-primary">Track Orders</Link>
          <Link to="/shop" className="btn-outline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/cart" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Shipping */}
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-400" /> Shipping Address
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'name', label: 'Full Name', type: 'text', required: true },
                  { key: 'phone', label: 'Phone', type: 'tel', required: true },
                  { key: 'line1', label: 'Address Line 1', type: 'text', required: true },
                  { key: 'city', label: 'City', type: 'text', required: true },
                  { key: 'state', label: 'State', type: 'text', required: true },
                  { key: 'pincode', label: 'Pincode', type: 'text', required: true },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-gray-400 mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      value={addr[f.key]}
                      onChange={e => setAddr({ ...addr, [f.key]: e.target.value })}
                      className="input text-sm py-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-400" /> Payment
              </h3>
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl border border-brand-500/50">
                <Truck className="w-5 h-5 text-brand-400" />
                <div>
                  <p className="font-medium text-white text-sm">Cash on Delivery</p>
                  <p className="text-xs text-gray-400">Pay when your order arrives</p>
                </div>
                <div className="ml-auto w-4 h-4 rounded-full border-2 border-brand-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                </div>
              </div>

              {/* Use wallet points */}
              {user?.walletPoints > 0 && (
                <div className="mt-3 flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-brand-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Use Wallet Points</p>
                      <p className="text-xs text-gray-400">Available: {user.walletPoints} pts</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUsePoints(!usePoints)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${usePoints ? 'bg-brand-500' : 'bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${usePoints ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.product._id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                      {item.product.images?.[0] && <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-medium text-white">₹{(item.product.price * item.qty).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
                </div>
                {voucherMax > 0 && (
                  <div className="flex justify-between text-gold-400">
                    <span>Voucher Discount (10%)</span><span>-₹{voucherMax}</span>
                  </div>
                )}
                {usePoints && pointsDiscount > 0 && (
                  <div className="flex justify-between text-brand-400">
                    <span>Wallet Points</span><span>-₹{Math.floor(pointsDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-green-400 text-xs">
                  <span>Monthly Cashback (2%)</span>
                  <span>₹{Math.floor(total * 0.02)}/mo × 50</span>
                </div>
                <div className="border-t border-gray-700 pt-2 flex justify-between text-white font-bold text-base">
                  <span>Total (COD)</span><span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placing || !items.length}
                className="btn-primary w-full justify-center mt-4 py-3"
              >
                {placing ? 'Placing Order...' : `Place Order ₹${total.toLocaleString()} (COD)`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
