import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star, TrendingUp, Users, Wallet, Trophy, ArrowRight, CheckCircle,
  Crown, LayoutDashboard, CreditCard, Gift, LogOut, User, Globe, Menu, X,
} from 'lucide-react';
import useAuthStore from '../store/authStore.js';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

export default function AgentDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [pool, setPool]               = useState([]);
  const [referrals, setReferrals]     = useState([]);
  const [walletEntries, setWalletEntries] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api.get('/agent/pool').then(r => setPool(r.data)).catch(() => {});
    api.get('/referral/my').then(r => setReferrals(r.data || [])).catch(() => {});
    api.get('/wallet/cashback-schedule').then(r => setWalletEntries(r.data)).catch(() => {});
  }, []);

  if (!user?.isAgent) {
    return (
      <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 55% 5%,#160832 0%,#050010 40%,#000305 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Crown style={{ width: 52, height: 52, color: 'rgba(251,191,36,.5)', margin: '0 auto 16px' }} />
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Not an Agent Yet</h2>
          <p style={{ color: 'rgba(167,139,250,.55)', marginBottom: 20 }}>Register as a sales agent to access this dashboard</p>
          <Link to="/agent/register" style={{ padding: '12px 28px', borderRadius: 14, background: 'linear-gradient(135deg,#fde68a,#fbbf24,#f97316)', color: '#1a0a00', fontWeight: 900, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>Become an Agent</Link>
        </div>
      </div>
    );
  }

  const handleQualifyPool = async () => {
    try {
      await api.post('/agent/qualify-pool');
      toast.success('Added to Global Pool!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const monthlyCashback   = Math.round((user?.agentFee || 999) * 0.10);
  const cashbackEarned    = (user?.agentCashbackPaid || 0) * monthlyCashback;
  const cashbackRemaining = ((user?.agentCashbackMonths || 30) - (user?.agentCashbackPaid || 0)) * monthlyCashback;
  const cashbackPct       = Math.round(((user?.agentCashbackPaid || 0) / (user?.agentCashbackMonths || 30)) * 100);

  const SIDEBAR_ITEMS = [
    { id: 'overview',  label: 'Dashboard',     icon: LayoutDashboard },
    { id: 'cashback',  label: 'Cashback Plan', icon: TrendingUp },
    { id: 'pool',      label: 'Global Pool',   icon: Globe },
    { id: 'wallet',    label: 'Wallet',        icon: Wallet },
    { id: 'referral',  label: 'Referrals',     icon: Users },
    { id: 'profile',   label: 'Profile',       icon: User },
  ];

  const STATS = [
    { label: 'Cashback Earned',  value: `Rs.${cashbackEarned.toLocaleString()}`,    color: '#fbbf24', bg: 'rgba(251,191,36,.1)',  border: 'rgba(251,191,36,.25)',  icon: Star },
    { label: 'Still Incoming',   value: `Rs.${cashbackRemaining.toLocaleString()}`, color: '#34d399', bg: 'rgba(52,211,153,.1)',  border: 'rgba(52,211,153,.25)',  icon: TrendingUp },
    { label: 'Monthly Sales',    value: `Rs.${(user?.currentMonthSales || 0).toLocaleString()}`, color: '#22d3ee', bg: 'rgba(34,211,238,.1)', border: 'rgba(34,211,238,.25)', icon: CreditCard },
    { label: 'Wallet Points',    value: `${user?.walletPoints || 0} pts`,           color: '#a78bfa', bg: 'rgba(167,139,250,.1)', border: 'rgba(167,139,250,.25)', icon: Wallet },
  ];

  // referral links
  const custLink  = `${window.location.origin}/signup?ref=${user?.referralCode || ''}`;
  const agentLink = `${window.location.origin}/agent/register?ref=${user?.referralCode || ''}`;

  return (
    <>
      <style>{`
        .agent-page { display:flex; min-height:100vh; background:radial-gradient(ellipse at 60% 0%,#170935 0%,#050010 40%,#000305 100%); }
        .agent-sidebar { width:230px; min-height:100vh; background:rgba(6,2,20,.85); border-right:1px solid rgba(167,139,250,.12); display:flex; flex-direction:column; position:sticky; top:0; height:100vh; overflow-y:auto; flex-shrink:0; backdrop-filter:blur(20px); }
        .agent-content { flex:1; min-height:100vh; position:relative; }
        .ag-grid { position:fixed; inset:0; pointer-events:none; background-image:linear-gradient(rgba(124,58,237,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,.05) 1px,transparent 1px); background-size:48px 48px; z-index:0; }
        .ag-glass { background:linear-gradient(150deg,rgba(255,255,255,.04) 0%,rgba(124,58,237,.05) 60%,rgba(6,182,212,.02) 100%); border:1px solid rgba(167,139,250,.18); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.08); }
        .ag-sidebar-item { display:flex; align-items:center; gap:11px; padding:10px 16px; margin:2px 8px; border-radius:12px; border:1.5px solid transparent; cursor:pointer; transition:all .2s; color:rgba(167,139,250,.5); font-size:13.5px; font-weight:600; background:none; width:calc(100% - 16px); text-align:left; }
        .ag-sidebar-item:hover { color:#a78bfa; background:rgba(124,58,237,.1); }
        .ag-sidebar-item.active { color:#c4b5fd; background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(167,139,250,.1)); border-color:rgba(167,139,250,.3); }
        .ag-sect-hdr { display:flex; align-items:center; gap:12px; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid rgba(167,139,250,.1); }
        .ag-sect-hdr h2 { font-size:20px; font-weight:900; color:#fff; margin:0; }
        .ag-stat { padding:20px 18px; border-radius:18px; border:1px solid; }
        .ag-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(167,139,250,.07); font-size:13px; }
        .ag-row:last-child { border-bottom:none; }
        .ag-hamburger { display:none; width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,.04); border:1.5px solid rgba(167,139,250,.2); align-items:center; justify-content:center; color:rgba(196,181,253,.7); cursor:pointer; flex-shrink:0; transition:all .18s; }
        .ag-hamburger:hover { background:rgba(124,58,237,.15); border-color:rgba(167,139,250,.4); color:#c4b5fd; }
        .ag-mob-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:199; }
        .ag-mob-overlay.vis { display:block; }
        .ag-mobbar { display:none; position:sticky; top:0; z-index:20; padding:12px 16px; background:rgba(6,2,20,.7); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border-bottom:1px solid rgba(167,139,250,.1); align-items:center; gap:12px; }
        @media (max-width:860px) {
          .agent-sidebar { position:fixed !important; left:-260px; z-index:200; transition:left .3s ease; height:100vh !important; top:0; width:230px !important; }
          .agent-sidebar.open { left:0 !important; box-shadow:4px 0 40px rgba(0,0,0,.85); }
          .ag-hamburger { display:flex !important; }
          .ag-mobbar { display:flex !important; }
          .ag-stat-grid { grid-template-columns:repeat(2,1fr) !important; }
          .ag-2col { grid-template-columns:1fr !important; }
          .ag-main-pad { padding:18px 16px 50px !important; }
        }
        @media (max-width:480px) { .ag-stat-grid { grid-template-columns:1fr !important; } }
      `}</style>

      <div className="agent-page">
        <div className="ag-grid" />
        <div className={`ag-mob-overlay${sidebarOpen ? ' vis' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`agent-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div style={{ padding: '26px 20px 18px', borderBottom: '1px solid rgba(167,139,250,.1)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <span style={{ fontWeight: 900, fontSize: 22, background: 'linear-gradient(135deg,#fffde7,#fbbf24,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>GMT</span>
              <span style={{ fontWeight: 900, fontSize: 22, background: 'linear-gradient(135deg,#f0e6ff,#a78bfa,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>MART</span>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.3)', color: '#fbbf24', fontSize: 11, fontWeight: 700 }}>
              <Crown style={{ width: 11, height: 11 }} /> Sales Agent
            </span>
          </div>
          <nav style={{ padding: '10px 0', flex: 1 }}>
            {SIDEBAR_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                className={`ag-sidebar-item${activeSection === item.id ? ' active' : ''}`}
              >
                <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                {item.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: '10px 0 18px', borderTop: '1px solid rgba(167,139,250,.1)' }}>
            <button onClick={() => { logout(); navigate('/'); }} className="ag-sidebar-item" style={{ color: 'rgba(248,113,113,.55)' }}>
              <LogOut style={{ width: 15, height: 15 }} /> Logout
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="agent-content">
          <div className="ag-mobbar">
            <button className="ag-hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
              {sidebarOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
            </button>
            <span style={{ color: 'rgba(196,181,253,.5)', fontSize: 13, fontWeight: 600 }}>Agent Panel</span>
          </div>

          <div className="ag-main-pad" style={{ padding: '32px 28px 60px', position: 'relative', zIndex: 1 }}>

            {/* ── OVERVIEW ── */}
            {activeSection === 'overview' && (
              <>
                <div className="ag-sect-hdr">
                  <LayoutDashboard style={{ width: 22, height: 22, color: '#a78bfa' }} />
                  <div><h2>Dashboard</h2></div>
                  <div style={{ marginLeft: 'auto', fontSize: 13, color: 'rgba(196,181,253,.55)' }}>
                    Hi, <span style={{ color: '#fbbf24', fontWeight: 700 }}>{user?.name?.split(' ')[0]}</span> 👋
                  </div>
                </div>

                {/* Agent ID banner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 16, background: 'rgba(251,191,36,.07)', border: '1px solid rgba(251,191,36,.25)', marginBottom: 22, flexWrap: 'wrap' }}>
                  <Crown style={{ width: 20, height: 20, color: '#fbbf24', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ color: 'rgba(251,191,36,.6)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 3px' }}>Your Agent ID</p>
                    <p style={{ color: '#fbbf24', fontSize: 24, fontWeight: 900, fontFamily: 'monospace', margin: 0, letterSpacing: '.05em', textShadow: '0 0 18px rgba(251,191,36,.35)' }}>{user?.referralCode || '—'}</p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(user?.referralCode || ''); toast.success('Agent ID copied!'); }}
                    style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(251,191,36,.18)', border: '1.5px solid rgba(251,191,36,.4)', color: '#fbbf24', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                  >
                    📋 Copy ID
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(custLink); toast.success('Customer link copied!'); }}
                    style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(52,211,153,.15)', border: '1.5px solid rgba(52,211,153,.35)', color: '#34d399', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                  >
                    🔗 Copy Referral Link
                  </button>
                </div>

                {/* Stat cards */}
                <div className="ag-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
                  {STATS.map(s => (
                    <div key={s.label} className="ag-stat" style={{ background: s.bg, borderColor: s.border }}>
                      <div style={{ width: 36, height: 36, borderRadius: 11, background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <s.icon style={{ width: 17, height: 17, color: s.color }} />
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 4, textShadow: `0 0 20px ${s.color}55` }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: 'rgba(196,181,253,.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Quick links + Agent status */}
                <div className="ag-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="ag-glass" style={{ padding: 22 }}>
                    <h3 style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 14, marginBottom: 16 }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'View Cashback Plan', icon: Star,   onClick: () => setActiveSection('cashback'), color: '#fbbf24' },
                        { label: 'Global Pool Status', icon: Trophy, onClick: () => setActiveSection('pool'),     color: '#a78bfa' },
                        { label: 'Refer & Earn',       icon: Users,  onClick: () => setActiveSection('referral'), color: '#34d399' },
                        { label: 'My Wallet',          icon: Wallet, onClick: () => setActiveSection('wallet'),   color: '#22d3ee' },
                      ].map(a => (
                        <button key={a.label} onClick={a.onClick}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(167,139,250,.1)', color: 'rgba(196,181,253,.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,.1)'; e.currentTarget.style.color = '#c4b5fd'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.03)'; e.currentTarget.style.color = 'rgba(196,181,253,.7)'; }}
                        >
                          <a.icon style={{ width: 15, height: 15, color: a.color, flexShrink: 0 }} />
                          {a.label}
                          <ArrowRight style={{ width: 13, height: 13, marginLeft: 'auto', opacity: .5 }} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="ag-glass" style={{ padding: 22 }}>
                    <h3 style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 14, marginBottom: 16 }}>Agent Status</h3>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Status</span><span style={{ color: '#34d399', fontWeight: 700 }}>Active</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Registration fee</span><span style={{ color: '#fff', fontWeight: 700 }}>Rs.{user?.agentFee || 999}</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Monthly cashback</span><span style={{ color: '#fbbf24', fontWeight: 700 }}>Rs.{monthlyCashback}/mo</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Months paid</span><span style={{ color: '#fff', fontWeight: 700 }}>{user?.agentCashbackPaid || 0} / {user?.agentCashbackMonths || 30}</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Pool member</span><span style={{ color: user?.inGlobalPool ? '#34d399' : 'rgba(167,139,250,.4)', fontWeight: 700 }}>{user?.inGlobalPool ? 'Yes ✓' : 'No'}</span></div>
                  </div>
                </div>
              </>
            )}

            {/* ── CASHBACK PLAN ── */}
            {activeSection === 'cashback' && (
              <>
                <div className="ag-sect-hdr">
                  <Star style={{ width: 22, height: 22, color: '#fbbf24' }} />
                  <h2>Cashback Plan</h2>
                </div>
                <div className="ag-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="ag-glass" style={{ padding: 26 }}>
                    <h3 style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 15, marginBottom: 20 }}>Your Plan Details</h3>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Registration fee paid</span><span style={{ color: '#fff', fontWeight: 700 }}>Rs.{user?.agentFee || 999}</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Monthly cashback (10%)</span><span style={{ color: '#fbbf24', fontWeight: 800 }}>Rs.{monthlyCashback} / month</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Total months</span><span style={{ color: '#a78bfa', fontWeight: 700 }}>{user?.agentCashbackMonths || 30} months</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Months paid so far</span><span style={{ color: '#34d399', fontWeight: 700 }}>{user?.agentCashbackPaid || 0}</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Total earned</span><span style={{ color: '#34d399', fontWeight: 800 }}>Rs.{cashbackEarned.toLocaleString()}</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Still incoming</span><span style={{ color: '#fbbf24', fontWeight: 800 }}>Rs.{cashbackRemaining.toLocaleString()}</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Total (all months)</span><span style={{ color: '#fff', fontWeight: 700 }}>Rs.{(monthlyCashback * (user?.agentCashbackMonths || 30)).toLocaleString()}</span></div>
                  </div>
                  <div className="ag-glass" style={{ padding: 26, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 15, marginBottom: 20 }}>Progress</h3>
                      <div style={{ fontSize: 36, fontWeight: 900, color: '#fbbf24', marginBottom: 6, textShadow: '0 0 30px rgba(251,191,36,.4)' }}>{cashbackPct}%</div>
                      <div style={{ color: 'rgba(196,181,253,.5)', fontSize: 13, marginBottom: 20 }}>of total cashback received</div>
                      <div style={{ height: 12, borderRadius: 99, background: 'rgba(167,139,250,.15)', overflow: 'hidden', marginBottom: 8 }}>
                        <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#fbbf24,#f97316)', width: `${cashbackPct}%`, transition: 'width .6s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(167,139,250,.4)' }}>
                        <span>Rs.0</span>
                        <span>Rs.{(monthlyCashback * (user?.agentCashbackMonths || 30)).toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 14, background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.2)' }}>
                      <p style={{ color: 'rgba(251,191,36,.7)', fontSize: 12, margin: 0 }}>
                        Cashback is paid automatically every month.<br />
                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>{(user?.agentCashbackMonths || 30) - (user?.agentCashbackPaid || 0)} months remaining</span> — Rs.{cashbackRemaining.toLocaleString()} more to come.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── GLOBAL POOL ── */}
            {activeSection === 'pool' && (
              <>
                <div className="ag-sect-hdr">
                  <Globe style={{ width: 22, height: 22, color: '#a78bfa' }} />
                  <h2>Global Pool</h2>
                  <span style={{ padding: '4px 12px', borderRadius: 99, background: 'rgba(167,139,250,.1)', border: '1px solid rgba(167,139,250,.25)', color: '#a78bfa', fontSize: 12, fontWeight: 700 }}>{pool.length} members</span>
                </div>
                <div className="ag-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="ag-glass" style={{ padding: 26 }}>
                    <h3 style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Your Pool Status</h3>
                    {user?.inGlobalPool ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 16px', borderRadius: 14, background: 'rgba(52,211,153,.06)', border: '1px solid rgba(52,211,153,.2)', marginBottom: 16 }}>
                        <CheckCircle style={{ width: 32, height: 32, color: '#34d399', flexShrink: 0 }} />
                        <div>
                          <p style={{ color: '#34d399', fontWeight: 800, fontSize: 15, margin: '0 0 3px' }}>You're in the Global Pool!</p>
                          <p style={{ color: 'rgba(52,211,153,.6)', fontSize: 12, margin: 0 }}>Earning from 10-level 3×3 matrix</p>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(167,139,250,.05)', border: '1px solid rgba(167,139,250,.15)', marginBottom: 16 }}>
                        <p style={{ color: 'rgba(196,181,253,.7)', fontSize: 13, marginBottom: 6 }}>Requirement: <span style={{ color: '#fff', fontWeight: 700 }}>Rs.25,000 / month sales</span></p>
                        <p style={{ color: 'rgba(196,181,253,.55)', fontSize: 13, marginBottom: 16 }}>
                          Current monthly sales: <span style={{ color: (user?.currentMonthSales || 0) >= 25000 ? '#34d399' : '#fff', fontWeight: 700 }}>Rs.{(user?.currentMonthSales || 0).toLocaleString()}</span>
                        </p>
                        <button
                          onClick={handleQualifyPool}
                          disabled={(user?.currentMonthSales || 0) < 25000}
                          style={{ padding: '11px 22px', borderRadius: 12, background: 'linear-gradient(135deg,rgba(167,139,250,.2),rgba(124,58,237,.15))', border: '1.5px solid rgba(167,139,250,.35)', color: '#c4b5fd', fontWeight: 700, fontSize: 13, cursor: (user?.currentMonthSales || 0) >= 25000 ? 'pointer' : 'not-allowed', opacity: (user?.currentMonthSales || 0) >= 25000 ? 1 : .5 }}
                        >
                          Qualify for Global Pool
                        </button>
                      </div>
                    )}
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Matrix type</span><span style={{ color: '#fff', fontWeight: 700 }}>3×10 (10 levels)</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Monthly requirement</span><span style={{ color: '#fbbf24', fontWeight: 700 }}>Rs.25,000 sales</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Total pool members</span><span style={{ color: '#a78bfa', fontWeight: 700 }}>{pool.length}</span></div>
                  </div>
                  <div className="ag-glass" style={{ padding: 26 }}>
                    <h3 style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Pool Members</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                      {pool.slice(0, 20).map((p, i) => (
                        <div key={p._id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(124,58,237,.06)' }}>
                          <div style={{ width: 28, height: 28, borderRadius: 99, background: 'rgba(167,139,250,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#a78bfa', fontWeight: 800, flexShrink: 0 }}>#{i + 1}</div>
                          <div>
                            <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: 0 }}>{p.name || 'Agent'}</p>
                            <p style={{ color: 'rgba(196,181,253,.4)', fontSize: 11, margin: 0 }}>Rs.{(p.currentMonthSales || 0).toLocaleString()}/mo</p>
                          </div>
                          <CheckCircle style={{ width: 14, height: 14, color: '#34d399', marginLeft: 'auto' }} />
                        </div>
                      ))}
                      {pool.length === 0 && <p style={{ color: 'rgba(167,139,250,.35)', textAlign: 'center', padding: '20px 0' }}>No members yet</p>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── WALLET ── */}
            {activeSection === 'wallet' && (
              <>
                <div className="ag-sect-hdr">
                  <Wallet style={{ width: 22, height: 22, color: '#a78bfa' }} />
                  <h2>Wallet</h2>
                </div>
                <div className="ag-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="ag-glass" style={{ padding: 26 }}>
                    <h3 style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Balance</h3>
                    <div style={{ fontSize: 40, fontWeight: 900, color: '#a78bfa', marginBottom: 4, textShadow: '0 0 30px rgba(167,139,250,.4)' }}>{user?.walletPoints || 0}</div>
                    <div style={{ color: 'rgba(167,139,250,.5)', fontSize: 13, marginBottom: 20 }}>points &nbsp;•&nbsp; 1 pt = Rs.1</div>
                  </div>
                  <div className="ag-glass" style={{ padding: 26 }}>
                    <h3 style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Cashback Schedule</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                      {walletEntries.slice(0, 8).map(e => (
                        <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(167,139,250,.06)' }}>
                          <span style={{ color: 'rgba(196,181,253,.55)', fontSize: 12 }}>Order #{e.order?.orderNumber}</span>
                          <span style={{ color: '#34d399', fontWeight: 700, fontSize: 12 }}>+Rs.{Math.floor(e.orderAmount * 0.02)}/mo × {(e.totalMonths || 50) - (e.paidMonths || 0)} left</span>
                        </div>
                      ))}
                      {walletEntries.length === 0 && <p style={{ color: 'rgba(167,139,250,.35)', textAlign: 'center', padding: '20px 0', fontSize: 13 }}>No active cashback plans</p>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── REFERRALS ── */}
            {activeSection === 'referral' && (
              <>
                <div className="ag-sect-hdr">
                  <Users style={{ width: 22, height: 22, color: '#34d399' }} />
                  <h2>Referrals</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680 }}>

                  {/* Agent ID */}
                  <div className="ag-glass" style={{ padding: 24 }}>
                    <h3 style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 14, marginBottom: 16 }}>Your Agent ID</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 200px' }}>
                        <p style={{ color: 'rgba(251,191,36,.65)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>Unique Agent ID</p>
                        <p style={{ color: '#fbbf24', fontSize: 28, fontWeight: 900, fontFamily: 'monospace', margin: 0, letterSpacing: '.05em', textShadow: '0 0 22px rgba(251,191,36,.4)' }}>{user?.referralCode || '—'}</p>
                        <p style={{ color: 'rgba(196,181,253,.4)', fontSize: 11, margin: '5px 0 0' }}>Share this ID — customers enter it during registration</p>
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(user?.referralCode || ''); toast.success('Agent ID copied!'); }}
                        style={{ padding: '11px 20px', borderRadius: 12, background: 'rgba(251,191,36,.18)', border: '1.5px solid rgba(251,191,36,.4)', color: '#fbbf24', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}
                      >
                        📋 Copy ID
                      </button>
                    </div>
                  </div>

                  {/* Customer Referral Link */}
                  <div className="ag-glass" style={{ padding: 24 }}>
                    <h3 style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 14, marginBottom: 6 }}>Customer Referral Link</h3>
                    <p style={{ color: 'rgba(196,181,253,.45)', fontSize: 12, marginBottom: 14 }}>
                      Kisi bhi customer ko ye link bhejein. Link se register karne par wo automatically aapke referral network mein add ho jaayega.
                    </p>
                    <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(52,211,153,.07)', border: '1px solid rgba(52,211,153,.25)', marginBottom: 10 }}>
                      <p style={{ color: 'rgba(52,211,153,.6)', fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', margin: '0 0 6px' }}>Signup Link</p>
                      <p style={{ color: '#34d399', fontSize: 12.5, fontFamily: 'monospace', margin: '0 0 12px', wordBreak: 'break-all' }}>{custLink}</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => { navigator.clipboard.writeText(custLink); toast.success('Customer link copied!'); }}
                          style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(52,211,153,.18)', border: '1.5px solid rgba(52,211,153,.4)', color: '#34d399', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                        >
                          📋 Copy Link
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`🛍 Join GMT Mart & get ₹1000 welcome bonus!\n\nRegister here 👇\n${custLink}\n\nMera referral code: ${user?.referralCode || ''}`)}`}
                          target="_blank" rel="noreferrer"
                          style={{ padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', fontWeight: 700, fontSize: 12.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          📱 Share on WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Agent Recruitment Link */}
                  <div className="ag-glass" style={{ padding: 24 }}>
                    <h3 style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 14, marginBottom: 6 }}>Agent Recruitment Link</h3>
                    <p style={{ color: 'rgba(196,181,253,.45)', fontSize: 12, marginBottom: 14 }}>
                      Kisi ko Sales Agent banane ke liye ye link bhejein. Is link se join karne wale agent bhi aapke network mein aayenge.
                    </p>
                    <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(251,191,36,.07)', border: '1px solid rgba(251,191,36,.22)', marginBottom: 10 }}>
                      <p style={{ color: 'rgba(251,191,36,.6)', fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', margin: '0 0 6px' }}>Agent Register Link</p>
                      <p style={{ color: '#fbbf24', fontSize: 12.5, fontFamily: 'monospace', margin: '0 0 12px', wordBreak: 'break-all' }}>{agentLink}</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => { navigator.clipboard.writeText(agentLink); toast.success('Agent link copied!'); }}
                          style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(251,191,36,.15)', border: '1.5px solid rgba(251,191,36,.35)', color: '#fbbf24', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                        >
                          📋 Copy Link
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`💼 GMT Mart Sales Agent bano aur kamaao!\n\nRegister karo yahan 👇\n${agentLink}`)}`}
                          target="_blank" rel="noreferrer"
                          style={{ padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', fontWeight: 700, fontSize: 12.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          📱 Share on WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Network stats */}
                  <div className="ag-glass" style={{ padding: 24 }}>
                    <h3 style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Network Stats</h3>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Total network</span><span style={{ color: '#a78bfa', fontWeight: 700 }}>{referrals.length} members</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Level 1 (10% commission)</span><span style={{ color: '#34d399', fontWeight: 700 }}>Direct referrals</span></div>
                    <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Levels 2–5 (1% each)</span><span style={{ color: 'rgba(196,181,253,.7)' }}>Sub-network</span></div>
                  </div>
                </div>
              </>
            )}

            {/* ── PROFILE ── */}
            {activeSection === 'profile' && (
              <>
                <div className="ag-sect-hdr">
                  <User style={{ width: 22, height: 22, color: '#a78bfa' }} />
                  <h2>Profile</h2>
                </div>
                <div className="ag-glass" style={{ padding: 28, maxWidth: 480 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid rgba(167,139,250,.1)' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 99, background: 'linear-gradient(135deg,rgba(124,58,237,.3),rgba(167,139,250,.2))', border: '2px solid rgba(167,139,250,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#a78bfa', flexShrink: 0 }}>
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 900, fontSize: 17, margin: '0 0 3px' }}>{user?.name}</p>
                      <p style={{ color: 'rgba(196,181,253,.5)', fontSize: 12, margin: 0 }}>{user?.email}</p>
                    </div>
                  </div>
                  <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Phone</span><span style={{ color: '#fff', fontWeight: 700 }}>{user?.phone || '—'}</span></div>
                  <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Agent ID</span><span style={{ color: '#fbbf24', fontWeight: 800, fontFamily: 'monospace', fontSize: 15 }}>{user?.referralCode || '—'}</span></div>
                  <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Role</span><span style={{ color: '#fbbf24', fontWeight: 700 }}>Sales Agent</span></div>
                  <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Wallet points</span><span style={{ color: '#a78bfa', fontWeight: 700 }}>{user?.walletPoints || 0} pts</span></div>
                  <div className="ag-row"><span style={{ color: 'rgba(196,181,253,.5)' }}>Pool member</span><span style={{ color: user?.inGlobalPool ? '#34d399' : 'rgba(167,139,250,.4)', fontWeight: 700 }}>{user?.inGlobalPool ? 'Yes' : 'No'}</span></div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </>
  );
}
