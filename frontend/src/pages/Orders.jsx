import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import api from '../api/axios.js';

const STATUS_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_COLOR = {
  placed: 'text-blue-400 bg-blue-400/10',
  confirmed: 'text-cyan-400 bg-cyan-400/10',
  processing: 'text-yellow-400 bg-yellow-400/10',
  shipped: 'text-orange-400 bg-orange-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(r => { setOrders(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">My <span className="gradient-text">Orders</span></h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No orders yet. <Link to="/shop" className="text-brand-400">Shop now!</Link></p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => {
            const stepIdx = STATUS_STEPS.indexOf(o.status);
            return (
              <Link key={o._id} to={`/orders/${o._id}`} className="card p-5 block hover:border-brand-500/40 hover:bg-gray-900 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">Order #{o.orderNumber}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {o.items.length} item{o.items.length > 1 ? 's' : ''} •{' '}
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-white">₹{o.netAmount?.toLocaleString()}</p>
                      <p className="text-xs text-green-400">₹{Math.floor(o.netAmount * 0.02)}/mo cashback</p>
                    </div>
                    <span className={`badge ${STATUS_COLOR[o.status] || 'text-gray-400 bg-gray-700'} capitalize`}>{o.status}</span>
                  </div>
                </div>

                {/* Progress bar */}
                {o.status !== 'cancelled' && stepIdx >= 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      {STATUS_STEPS.map((s, i) => (
                        <span key={s} className={`text-xs capitalize ${i <= stepIdx ? 'text-brand-400' : 'text-gray-600'}`}>{s}</span>
                      ))}
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${((stepIdx + 1) / STATUS_STEPS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
