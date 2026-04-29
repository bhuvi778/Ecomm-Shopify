import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, ArrowDownToLine, TrendingUp, History, CreditCard } from 'lucide-react';
import useAuthStore from '../store/authStore.js';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const TXN_ICONS = {
  cashback: '💰',
  referral: '🤝',
  agent_cashback: '⭐',
  roi: '📈',
  voucher_credit: '🎁',
  purchase_debit: '🛍️',
  withdrawal: '💸',
  registration_fee: '📋',
};

export default function Wallet() {
  const { user, refreshUser } = useAuthStore();
  const [txns, setTxns] = useState([]);
  const [cashbacks, setCashbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdraw, setWithdraw] = useState({ points: '', upiId: '', bankName: '', accountNumber: '', ifsc: '' });

  useEffect(() => {
    Promise.all([
      api.get('/wallet/transactions').then(r => setTxns(r.data)),
      api.get('/wallet/cashback-schedule').then(r => setCashbacks(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      await api.post('/wallet/withdraw', { ...withdraw, points: Number(withdraw.points) });
      toast.success('Withdrawal request submitted!');
      setShowWithdraw(false);
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const totalMonthlyIncoming = cashbacks
    .filter(e => !e.completed)
    .reduce((s, e) => s + Math.floor(e.orderAmount * 0.02), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">My <span className="gradient-text">Wallet</span></h1>

      {/* Balance card */}
      <div className="relative card p-8 mb-6 overflow-hidden bg-gradient-to-br from-brand-500/20 to-pink-500/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -translate-y-32 translate-x-32" />
        <p className="text-gray-400 text-sm mb-1">Total Wallet Balance</p>
        <div className="text-5xl font-black text-white mb-1">
          {user?.walletPoints?.toLocaleString() || 0}
          <span className="text-2xl text-gray-400 font-normal ml-1">pts</span>
        </div>
        <p className="text-brand-400 text-sm">= ₹{user?.walletPoints?.toLocaleString() || 0} (1 pt = ₹1)</p>

        <div className="flex gap-4 mt-6">
          <button onClick={() => setShowWithdraw(true)} className="btn-primary text-sm py-2 px-4">
            <ArrowDownToLine className="w-4 h-4" /> Withdraw
          </button>
          <div className="card px-4 py-2 text-sm">
            <span className="text-green-400 font-medium">+₹{totalMonthlyIncoming}/mo</span>
            <span className="text-gray-500 ml-1">incoming</span>
          </div>
        </div>
      </div>

      {/* Voucher */}
      {user?.welcomeVoucher && (
        <div className="card p-5 mb-6 border-gold-500/20 bg-gold-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold-400 font-semibold">🎁 Welcome Voucher</p>
              <p className="text-gray-400 text-sm">10% off on every purchase</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">₹{(user.welcomeVoucher.amount - (user.welcomeVoucher.used || 0)).toLocaleString()}</p>
              <p className="text-xs text-gray-500">of ₹{user.welcomeVoucher.amount} remaining</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Cashback Plans */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" /> Active Cashback Plans
          </h3>
          {cashbacks.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No cashback plans yet. Place an order!</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {cashbacks.map(e => {
                const monthly = Math.floor(e.orderAmount * 0.02);
                const remaining = e.totalMonths - e.paidMonths;
                const pct = Math.round((e.paidMonths / e.totalMonths) * 100);
                return (
                  <div key={e._id} className="p-3 bg-gray-800/50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-white">₹{e.orderAmount.toLocaleString()} order</p>
                        <p className="text-xs text-gray-400">{e.paidMonths}/{e.totalMonths} months paid</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-medium text-sm">₹{monthly}/mo</p>
                        <p className="text-xs text-gray-500">{remaining} left</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-brand-400" /> Transactions
          </h3>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
          ) : txns.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No transactions yet</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {txns.map(t => (
                <div key={t._id} className="flex items-center justify-between p-2.5 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{TXN_ICONS[t.type] || '💳'}</span>
                    <div>
                      <p className="text-xs font-medium text-white">{t.description || t.type}</p>
                      <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${t.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {t.points > 0 ? '+' : ''}{t.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-6 w-full max-w-md"
          >
            <h3 className="font-semibold text-white text-lg mb-4">Withdraw Points</h3>
            <form onSubmit={handleWithdraw} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Points to Withdraw (min 100)</label>
                <input
                  type="number"
                  min={100}
                  max={user?.walletPoints}
                  value={withdraw.points}
                  onChange={e => setWithdraw({ ...withdraw, points: e.target.value })}
                  required
                  className="input text-sm"
                  placeholder={`Max: ${user?.walletPoints}`}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">UPI ID</label>
                <input type="text" value={withdraw.upiId} onChange={e => setWithdraw({ ...withdraw, upiId: e.target.value })} className="input text-sm" placeholder="yourname@upi" />
              </div>
              <p className="text-gray-500 text-xs text-center">— OR —</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Bank Name</label>
                  <input type="text" value={withdraw.bankName} onChange={e => setWithdraw({ ...withdraw, bankName: e.target.value })} className="input text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Account Number</label>
                  <input type="text" value={withdraw.accountNumber} onChange={e => setWithdraw({ ...withdraw, accountNumber: e.target.value })} className="input text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">IFSC Code</label>
                <input type="text" value={withdraw.ifsc} onChange={e => setWithdraw({ ...withdraw, ifsc: e.target.value })} className="input text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowWithdraw(false)} className="btn-outline flex-1 py-2 text-sm">Cancel</button>
                <button type="submit" className="btn-primary flex-1 py-2 text-sm">Submit</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
