import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Users, ChevronRight, TrendingUp } from 'lucide-react';
import useAuthStore from '../store/authStore.js';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

export default function Referral() {
  const { user } = useAuthStore();
  const [link, setLink] = useState(null);
  const [network, setNetwork] = useState(null);
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/referral/my-link').then(r => setLink(r.data)),
      api.get('/referral/my-network').then(r => setNetwork(r.data)),
      api.get('/referral/earnings').then(r => setEarnings(r.data)),
    ]).catch(() => {});
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(link?.referralLink || '');
    toast.success('Link copied!');
  };

  const totalNetwork = network ? Object.values(network).reduce((s, lvl) => s + (lvl?.length || 0), 0) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Refer & <span className="gradient-text">Earn</span></h1>
      <p className="text-gray-400 mb-8">Earn 10% on every purchase by your direct referrals + 1% on 4 more levels!</p>

      {/* Referral Link */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-white mb-3">Your Referral Link</h3>
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 truncate font-mono">
            {link?.referralLink || 'Loading...'}
          </div>
          <button onClick={copyLink} className="btn-primary py-2 px-4 text-sm">
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button
            onClick={() => navigator.share?.({ url: link?.referralLink, title: 'Join GM Mart!' })}
            className="btn-outline py-2 px-4 text-sm"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Code: <span className="text-brand-400 font-mono font-bold">{user?.referralCode}</span></p>
      </div>

      {/* Commission Structure */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-white mb-4">Commission Structure</h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            { level: 1, rate: '10%', color: 'from-brand-500 to-pink-500' },
            { level: 2, rate: '1%', color: 'from-blue-500 to-cyan-500' },
            { level: 3, rate: '1%', color: 'from-green-500 to-emerald-500' },
            { level: 4, rate: '1%', color: 'from-orange-500 to-amber-500' },
            { level: 5, rate: '1%', color: 'from-purple-500 to-brand-500' },
          ].map(l => (
            <div key={l.level} className="text-center">
              <div className={`card p-3 mb-2 bg-gradient-to-br ${l.color} bg-opacity-20`}>
                <div className="text-xl font-black text-white">{l.rate}</div>
                <div className="text-xs text-gray-300">Level {l.level}</div>
              </div>
              <div className="text-xs text-gray-500">{network?.[`level${l.level}`]?.length || 0} people</div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings + Network Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" /> Referral Earnings
          </h3>
          <div className="text-4xl font-black text-green-400 mb-1">₹{earnings?.total || 0}</div>
          <p className="text-gray-400 text-sm mb-4">Total earned from referrals</p>
          {earnings?.transactions?.slice(0, 5).map(t => (
            <div key={t._id} className="flex justify-between text-sm py-2 border-b border-gray-800">
              <span className="text-gray-400">{t.description}</span>
              <span className="text-green-400 font-medium">+{t.points} pts</span>
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" /> Your Network
          </h3>
          <div className="text-4xl font-black text-brand-400 mb-1">{totalNetwork}</div>
          <p className="text-gray-400 text-sm mb-4">Total people in your network</p>
          {network && Object.entries(network).map(([lvl, users]) => (
            <div key={lvl} className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-sm text-gray-400 capitalize">{lvl.replace('level', 'Level ')}</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">{users.length} members</span>
                <ChevronRight className="w-3 h-3 text-gray-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
