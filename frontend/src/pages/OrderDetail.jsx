import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Package } from 'lucide-react';
import api from '../api/axios.js';

const STATUS_COLOR = {
  placed: 'bg-blue-400/10 text-blue-400',
  confirmed: 'bg-cyan-400/10 text-cyan-400',
  processing: 'bg-yellow-400/10 text-yellow-400',
  shipped: 'bg-orange-400/10 text-orange-400',
  delivered: 'bg-green-400/10 text-green-400',
  cancelled: 'bg-red-400/10 text-red-400',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(() => {});
  }, [id]);

  if (!order) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Order #{order.orderNumber}</h1>
          <p className="text-gray-400 text-sm mt-1">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <span className={`badge ${STATUS_COLOR[order.status] || ''} capitalize text-sm px-3 py-1.5`}>{order.status}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-brand-400" /> Items</h3>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item._id} className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                  </div>
                  <p className="font-medium text-white text-sm">₹{(item.price * item.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-400" /> Shipping To</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p className="font-medium text-white">{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.line1}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p className="text-gray-400">📞 {order.shippingAddress?.phone}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span><span>₹{order.totalAmount?.toLocaleString()}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-gold-400">
                <span>Voucher</span><span>-₹{order.discountAmount}</span>
              </div>
            )}
            {order.pointsUsed > 0 && (
              <div className="flex justify-between text-brand-400">
                <span>Points Used</span><span>-{order.pointsUsed} pts</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-white border-t border-gray-700 pt-2">
              <span>Total (COD)</span><span>₹{order.netAmount?.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-500/5 rounded-xl border border-green-500/20">
            <p className="text-green-400 text-xs font-medium">💰 Cashback</p>
            <p className="text-white text-sm font-medium">₹{Math.floor(order.netAmount * 0.02)}/month</p>
            <p className="text-gray-500 text-xs">for 50 months = ₹{order.netAmount?.toLocaleString()} back!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
