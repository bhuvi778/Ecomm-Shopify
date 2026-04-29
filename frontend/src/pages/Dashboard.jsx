import React, { useEffect, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Package, Wallet, Users, TrendingUp, ShoppingBag, Gift, ArrowRight, Crown, Zap, LayoutDashboard, LogOut, User, Copy, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/authStore.js';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  placed:     { color:'#60a5fa', bg:'rgba(96,165,250,.12)',  border:'rgba(96,165,250,.3)'  },
  confirmed:  { color:'#22d3ee', bg:'rgba(34,211,238,.12)',  border:'rgba(34,211,238,.3)'  },
  processing: { color:'#fbbf24', bg:'rgba(251,191,36,.12)',  border:'rgba(251,191,36,.3)'  },
  shipped:    { color:'#fb923c', bg:'rgba(251,146,60,.12)',  border:'rgba(251,146,60,.3)'  },
  delivered:  { color:'#34d399', bg:'rgba(52,211,153,.12)',  border:'rgba(52,211,153,.3)'  },
  cancelled:  { color:'#f87171', bg:'rgba(248,113,113,.12)', border:'rgba(248,113,113,.3)' },
};

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Redirect admin / agent users to their own dashboards
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.isAgent)          return <Navigate to="/agent" replace />;

  const [section, setSection]       = useState('overview');
  const [orders, setOrders]         = useState([]);
  const [transactions, setTxns]     = useState([]);
  const [referralLink, setRefLink]  = useState(null);
  const [referralNetwork, setRefNw] = useState(null);
  const [referralEarnings, setRefE] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [copied, setCopied]         = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [withdraw, setWithdraw]     = useState({ points:'', method:'upi', upiId:'', bankName:'', accountNumber:'', ifsc:'' });
  const [wSubmitting, setWSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/orders/my').then(r => setOrders(r.data)).catch(() => {}),
      api.get('/wallet/transactions').then(r => setTxns(r.data)).catch(() => {}),
      api.get('/referral/my-link').then(r => setRefLink(r.data)).catch(() => {}),
      api.get('/referral/my-network').then(r => setRefNw(r.data)).catch(() => {}),
      api.get('/referral/earnings').then(r => setRefE(r.data?.totalEarnings || 0)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const voucherBalance = (user?.welcomeVoucher?.amount || 0) - (user?.welcomeVoucher?.used || 0);
  const referralCount  = (referralNetwork?.levels || []).reduce((s, l) => s + (l.count || 0), 0);

  const SIDEBAR_ITEMS = [
    { id:'overview',  label:'Overview',   icon:LayoutDashboard },
    { id:'orders',    label:'My Orders',  icon:Package, badge: orders.length || null },
    { id:'wallet',    label:'Wallet',     icon:Wallet },
    { id:'vouchers',  label:'Vouchers',   icon:Gift },
    { id:'referrals', label:'Referrals',  icon:Users },
    { id:'profile',   label:'Profile',    icon:User },
  ];

  const STATS = [
    { id:'wallet',    icon:Wallet,  label:'Wallet Points',   value:`${user?.walletPoints || 0} pts`, sub:'1 pt = Rs.1',                color:'#a78bfa', bg:'rgba(167,139,250,.1)', border:'rgba(167,139,250,.3)' },
    { id:'orders',    icon:Package, label:'Total Orders',    value:orders.length,                    sub:'All time',                   color:'#22d3ee', bg:'rgba(34,211,238,.1)',  border:'rgba(34,211,238,.3)' },
    { id:'vouchers',  icon:Gift,    label:'Voucher Balance', value:`Rs.${voucherBalance}`,           sub:'20% off, auto-applied',      color:'#fbbf24', bg:'rgba(251,191,36,.1)',  border:'rgba(251,191,36,.3)' },
    { id:'referrals', icon:Users,   label:'Referrals',       value:referralCount,                    sub:`Rs.${referralEarnings.toLocaleString()} earned`, color:'#34d399', bg:'rgba(52,211,153,.1)',  border:'rgba(52,211,153,.3)' },
  ];

  const copyRefLink = async () => {
    if (!referralLink?.link) return;
    try {
      await navigator.clipboard.writeText(referralLink.link);
      setCopied(true); toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 1800);
    } catch { toast.error('Copy failed'); }
  };

  const submitWithdraw = async (e) => {
    e.preventDefault();
    if (!withdraw.points || Number(withdraw.points) < 100) { toast.error('Minimum withdraw: 100 pts'); return; }
    if (Number(withdraw.points) > (user?.walletPoints || 0)) { toast.error('Insufficient points'); return; }
    setWSubmitting(true);
    try {
      await api.post('/wallet/withdraw', { ...withdraw, points: Number(withdraw.points) });
      toast.success('Withdrawal request submitted!');
      setWithdraw({ points:'', method:'upi', upiId:'', bankName:'', accountNumber:'', ifsc:'' });
      api.get('/wallet/transactions').then(r => setTxns(r.data));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setWSubmitting(false); }
  };

  return (
    <>
      <style>{`
        .ud-page { display:flex; min-height:100vh; background:radial-gradient(ellipse at 60% 0%,#170935 0%,#050010 40%,#000305 100%); color:#e9e6ff; }
        .ud-sidebar { width:240px; background:rgba(6,2,20,.85); border-right:1px solid rgba(167,139,250,.12); display:flex; flex-direction:column; position:sticky; top:0; height:100vh; overflow-y:auto; flex-shrink:0; backdrop-filter:blur(20px); }
        .ud-content { flex:1; min-width:0; display:flex; flex-direction:column; min-height:100vh; }
        .ud-grid { position:fixed; inset:0; pointer-events:none; background-image:linear-gradient(rgba(124,58,237,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,.05) 1px,transparent 1px); background-size:48px 48px; z-index:0; }
        .ud-glass { background:linear-gradient(150deg,rgba(255,255,255,.04) 0%,rgba(124,58,237,.05) 60%,rgba(6,182,212,.02) 100%); border:1px solid rgba(167,139,250,.18); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border-radius:20px; box-shadow:0 16px 48px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.07); }
        .ud-side-item { display:flex; align-items:center; gap:11px; padding:10px 16px; margin:2px 8px; border-radius:12px; border:1.5px solid transparent; cursor:pointer; transition:all .2s; color:rgba(167,139,250,.5); font-size:13.5px; font-weight:600; background:none; width:calc(100% - 16px); text-align:left; }
        .ud-side-item:hover { color:#a78bfa; background:rgba(124,58,237,.1); }
        .ud-side-item.active { color:#c4b5fd; background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(167,139,250,.1)); border-color:rgba(167,139,250,.3); }
        .ud-topbar { position:sticky; top:0; z-index:20; background:rgba(6,2,20,.7); backdrop-filter:blur(18px); border-bottom:1px solid rgba(167,139,250,.1); padding:14px 28px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .ud-stat { padding:18px; border-radius:18px; cursor:pointer; transition:transform .18s,box-shadow .18s; border:1.5px solid; text-align:left; background:rgba(255,255,255,.02); }
        .ud-stat:hover { transform:translateY(-3px); box-shadow:0 22px 48px rgba(0,0,0,.6); }
        .ud-row { display:flex; justify-content:space-between; align-items:center; padding:11px 0; border-bottom:1px solid rgba(167,139,250,.08); font-size:13.5px; }
        .ud-row:last-child { border-bottom:none; }
        .ud-pill { display:inline-flex; align-items:center; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; border:1px solid; }
        .ud-input { width:100%; padding:11px 13px; border-radius:11px; background:rgba(255,255,255,.04); border:1.5px solid rgba(167,139,250,.22); color:#fff; font-size:13.5px; outline:none; box-sizing:border-box; transition:border-color .2s; }
        .ud-input:focus { border-color:rgba(167,139,250,.5); }
        .ud-btn { padding:11px 22px; border-radius:12px; font-weight:700; font-size:13px; border:1.5px solid; cursor:pointer; transition:all .15s; display:inline-flex; align-items:center; gap:7px; }
        .ud-btn-primary { background:linear-gradient(135deg,rgba(167,139,250,.2),rgba(124,58,237,.12)); border-color:rgba(167,139,250,.35); color:#c4b5fd; }
        .ud-btn-primary:hover:not(:disabled) { background:linear-gradient(135deg,rgba(167,139,250,.3),rgba(124,58,237,.18)); }
        .ud-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
        .ud-btn-gold { background:linear-gradient(135deg,#fde68a,#fbbf24,#f97316); border:none; color:#1a0a00; font-weight:900; }
        .ud-link { color:#a78bfa; text-decoration:none; font-size:12px; font-weight:700; display:inline-flex; align-items:center; gap:4px; }
        .ud-sect-hdr { display:flex; align-items:center; gap:12px; margin-bottom:22px; padding-bottom:16px; border-bottom:1px solid rgba(167,139,250,.1); }
        .ud-sect-hdr h2 { font-size:20px; font-weight:900; color:#fff; margin:0; }
        @keyframes shimmer { 0%{background-position:-200% 0;}100%{background-position:200% 0;} }
        .ud-skel { border-radius:12px; background:linear-gradient(90deg,rgba(167,139,250,.07) 25%,rgba(167,139,250,.14) 50%,rgba(167,139,250,.07) 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; }
        @media (max-width: 860px) { .ud-sidebar { width:64px; } .ud-side-item span:not(.badge) { display:none; } .ud-stats-grid { grid-template-columns:1fr 1fr !important; } .ud-two-col { grid-template-columns:1fr !important; } }
      `}</style>

      <div className="ud-page">
        <div className="ud-grid" />

        {/* SIDEBAR */}
        <aside className="ud-sidebar">
          <div style={{ padding:'24px 20px 18px', borderBottom:'1px solid rgba(167,139,250,.1)' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:8 }}>
              <span style={{ fontWeight:900, fontSize:21, background:'linear-gradient(135deg,#fffde7,#fbbf24,#f97316)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>GMT</span>
              <span style={{ fontWeight:900, fontSize:21, background:'linear-gradient(135deg,#f0e6ff,#a78bfa,#7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>MART</span>
            </div>
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:99, background:'rgba(167,139,250,.12)', border:'1px solid rgba(167,139,250,.3)', color:'#a78bfa', fontSize:11, fontWeight:700 }}>
              Customer
            </span>
          </div>

          <nav style={{ padding:'10px 0', flex:1 }}>
            {SIDEBAR_ITEMS.map(item => (
              <button key={item.id} onClick={() => setSection(item.id)} className={`ud-side-item${section===item.id?' active':''}`}>
                <item.icon style={{ width:16, height:16, flexShrink:0 }} />
                <span style={{ flex:1 }}>{item.label}</span>
                {item.badge != null && <span className="badge" style={{ padding:'2px 7px', borderRadius:99, background:'rgba(167,139,250,.18)', color:'#c4b5fd', fontSize:11, fontWeight:800 }}>{item.badge}</span>}
              </button>
            ))}

            <div style={{ height:1, background:'rgba(167,139,250,.1)', margin:'12px 16px' }} />
            <Link to="/shop" style={{ textDecoration:'none' }}>
              <div className="ud-side-item">
                <ShoppingBag style={{ width:16, height:16 }} />
                <span style={{ flex:1 }}>Shop Now</span>
                <ExternalLink style={{ width:13, height:13, opacity:.5 }} />
              </div>
            </Link>
            <Link to="/cart" style={{ textDecoration:'none' }}>
              <div className="ud-side-item">
                <ShoppingBag style={{ width:16, height:16 }} />
                <span style={{ flex:1 }}>My Cart</span>
                <ExternalLink style={{ width:13, height:13, opacity:.5 }} />
              </div>
            </Link>
          </nav>

          <div style={{ padding:'10px 0 18px', borderTop:'1px solid rgba(167,139,250,.1)' }}>
            <button onClick={() => { logout(); navigate('/'); }} className="ud-side-item" style={{ color:'rgba(248,113,113,.55)' }}>
              <LogOut style={{ width:15, height:15 }} /> <span style={{ flex:1 }}>Logout</span>
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="ud-content">
          {/* Top bar */}
          <div className="ud-topbar">
            <div>
              <h1 style={{ fontSize:'clamp(1.05rem,2vw,1.25rem)', fontWeight:900, color:'#fff', margin:'0 0 2px' }}>
                Hi, <span style={{ background:'linear-gradient(135deg,#fde68a,#fbbf24,#f97316)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{user?.name?.split(' ')[0]}</span> 👋
              </h1>
              <p style={{ color:'rgba(196,181,253,.5)', fontSize:12, margin:0 }}>Welcome back to your dashboard</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Link to="/agent/register" style={{ padding:'8px 14px', borderRadius:11, background:'rgba(251,191,36,.1)', border:'1px solid rgba(251,191,36,.3)', color:'#fbbf24', textDecoration:'none', fontWeight:700, fontSize:12, display:'flex', alignItems:'center', gap:5 }}>
                <Crown style={{ width:13, height:13 }} /> Become Agent
              </Link>
              <div style={{ width:34, height:34, borderRadius:99, background:'linear-gradient(135deg,rgba(124,58,237,.3),rgba(167,139,250,.18))', border:'1.5px solid rgba(167,139,250,.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#c4b5fd', fontWeight:900, fontSize:13 }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>

          <div style={{ padding:'28px 28px 60px', position:'relative', zIndex:1 }}>

            {/* OVERVIEW */}
            {section === 'overview' && (
              <>
                <div className="ud-sect-hdr">
                  <LayoutDashboard style={{ width:22, height:22, color:'#a78bfa' }} />
                  <h2>Overview</h2>
                </div>

                {/* Stat cards (clicking switches section) */}
                <div className="ud-stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
                  {STATS.map((s, i) => (
                    <button key={i} onClick={() => setSection(s.id)} className="ud-stat" style={{ background:s.bg, borderColor:s.border }}>
                      <div style={{ width:38, height:38, borderRadius:11, background:s.bg, border:`1.5px solid ${s.border}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                        <s.icon style={{ width:18, height:18, color:s.color }} />
                      </div>
                      <div style={{ fontSize:21, fontWeight:900, color:'#fff', lineHeight:1, marginBottom:4, textShadow:`0 0 20px ${s.color}55` }}>{s.value}</div>
                      <div style={{ fontSize:11, color:'rgba(196,181,253,.55)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2 }}>{s.label}</div>
                      <div style={{ fontSize:11, color:'rgba(167,139,250,.4)' }}>{s.sub}</div>
                    </button>
                  ))}
                </div>

                <div className="ud-two-col" style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18 }}>
                  {/* Recent Orders */}
                  <div className="ud-glass" style={{ padding:22 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                      <h3 style={{ fontSize:14, fontWeight:800, color:'#c4b5fd', margin:0 }}>Recent Orders</h3>
                      <button onClick={() => setSection('orders')} className="ud-link" style={{ background:'none', border:'none', cursor:'pointer' }}>View All <ArrowRight style={{ width:12, height:12 }} /></button>
                    </div>
                    {loading ? (
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>{[1,2,3].map(i => <div key={i} className="ud-skel" style={{ height:48 }} />)}</div>
                    ) : orders.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'24px 0' }}>
                        <ShoppingBag style={{ width:34, height:34, color:'rgba(167,139,250,.25)', margin:'0 auto 8px' }} />
                        <p style={{ color:'rgba(167,139,250,.4)', fontSize:13, margin:'0 0 8px' }}>No orders yet</p>
                        <Link to="/shop" className="ud-link">Shop now →</Link>
                      </div>
                    ) : orders.slice(0,5).map(o => {
                      const st = STATUS_STYLE[o.status] || STATUS_STYLE.placed;
                      return (
                        <div key={o._id} className="ud-row" style={{ cursor:'pointer' }} onClick={() => setSection('orders')}>
                          <div>
                            <p style={{ fontSize:13, fontWeight:700, color:'#fff', margin:'0 0 2px' }}>#{o.orderNumber}</p>
                            <p style={{ fontSize:11, color:'rgba(167,139,250,.4)', margin:0 }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <p style={{ fontSize:13, fontWeight:800, color:'#fbbf24', margin:'0 0 4px' }}>Rs.{o.netAmount?.toLocaleString()}</p>
                            <span className="ud-pill" style={{ color:st.color, background:st.bg, borderColor:st.border }}>{o.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick info column */}
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {/* Voucher card */}
                    <div className="ud-glass" style={{ padding:20, borderColor:'rgba(251,191,36,.25)' }}>
                      <h3 style={{ fontSize:13, fontWeight:800, color:'#fbbf24', margin:'0 0 10px', display:'flex', alignItems:'center', gap:6 }}>
                        <Gift style={{ width:14, height:14 }} /> Welcome Voucher
                      </h3>
                      <div style={{ fontSize:24, fontWeight:900, color:'#fff', lineHeight:1, marginBottom:6 }}>Rs.{voucherBalance}</div>
                      <p style={{ color:'rgba(251,191,36,.55)', fontSize:11, margin:0 }}>20% off auto-applied on every product</p>
                    </div>

                    {/* Become Agent CTA */}
                    <Link to="/agent/register" style={{ textDecoration:'none' }}>
                      <div className="ud-glass" style={{ padding:18, borderColor:'rgba(251,191,36,.25)', background:'rgba(251,191,36,.06)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                          <div style={{ width:36, height:36, borderRadius:11, background:'rgba(251,191,36,.15)', border:'1.5px solid rgba(251,191,36,.35)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <Zap style={{ width:17, height:17, color:'#fbbf24' }} />
                          </div>
                          <div style={{ flex:1 }}>
                            <p style={{ color:'#fbbf24', fontWeight:800, fontSize:13, margin:'0 0 2px' }}>Become a Sales Agent</p>
                            <p style={{ color:'rgba(251,191,36,.55)', fontSize:11, margin:0 }}>Earn 10% commission + Rs.3000/mo</p>
                          </div>
                          <ArrowRight style={{ width:14, height:14, color:'#fbbf24' }} />
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* ORDERS */}
            {section === 'orders' && (
              <>
                <div className="ud-sect-hdr">
                  <Package style={{ width:22, height:22, color:'#22d3ee' }} />
                  <h2>My Orders</h2>
                  <span style={{ padding:'4px 12px', borderRadius:99, background:'rgba(34,211,238,.12)', border:'1px solid rgba(34,211,238,.3)', color:'#22d3ee', fontSize:12, fontWeight:700 }}>{orders.length} orders</span>
                </div>
                <div className="ud-glass" style={{ padding:0, overflow:'hidden' }}>
                  {loading ? (
                    <div style={{ padding:22, display:'flex', flexDirection:'column', gap:10 }}>{[1,2,3,4].map(i => <div key={i} className="ud-skel" style={{ height:54 }} />)}</div>
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign:'center', padding:60 }}>
                      <ShoppingBag style={{ width:48, height:48, color:'rgba(167,139,250,.25)', margin:'0 auto 12px' }} />
                      <p style={{ color:'rgba(167,139,250,.5)', fontSize:14, margin:'0 0 12px' }}>You haven't placed any orders yet</p>
                      <Link to="/shop" className="ud-btn ud-btn-primary" style={{ textDecoration:'none' }}>Start shopping <ArrowRight style={{ width:14, height:14 }} /></Link>
                    </div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse' }}>
                        <thead>
                          <tr style={{ background:'rgba(124,58,237,.08)' }}>
                            {['Order #','Items','Amount','Status','Placed','Action'].map(h => (
                              <th key={h} style={{ padding:'12px 16px', fontSize:11, fontWeight:700, color:'rgba(167,139,250,.65)', textTransform:'uppercase', letterSpacing:'.08em', textAlign:'left' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(o => {
                            const st = STATUS_STYLE[o.status] || STATUS_STYLE.placed;
                            return (
                              <React.Fragment key={o._id}>
                              <tr style={{ borderBottom:'1px solid rgba(167,139,250,.06)' }}>
                                <td style={{ padding:'12px 16px', fontSize:13, fontWeight:800, color:'#fff' }}>#{o.orderNumber}</td>
                                <td style={{ padding:'12px 16px', fontSize:12, color:'rgba(196,181,253,.6)' }}>{o.items?.length || 0} items</td>
                                <td style={{ padding:'12px 16px', fontSize:13, fontWeight:800, color:'#fbbf24' }}>Rs.{o.netAmount?.toLocaleString()}</td>
                                <td style={{ padding:'12px 16px' }}><span className="ud-pill" style={{ color:st.color, background:st.bg, borderColor:st.border }}>{o.status}</span></td>
                                <td style={{ padding:'12px 16px', fontSize:12, color:'rgba(196,181,253,.45)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                                <td style={{ padding:'12px 16px' }}>
                                  <button onClick={() => setExpandedOrder(expandedOrder === o._id ? null : o._id)} className="ud-link" style={{ background:'none', border:'none', cursor:'pointer' }}>
                                    {expandedOrder === o._id ? 'Hide' : 'Details'} <ArrowRight style={{ width:11, height:11, transform: expandedOrder === o._id ? 'rotate(90deg)' : 'none', transition:'transform .2s' }} />
                                  </button>
                                </td>
                              </tr>
                              {expandedOrder === o._id && (
                                <tr style={{ background:'rgba(124,58,237,.04)' }}>
                                  <td colSpan={6} style={{ padding:'18px 22px' }}>
                                    <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:20 }}>
                                      <div>
                                        <h4 style={{ fontSize:12, fontWeight:800, color:'#c4b5fd', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'.08em' }}>Items ({o.items?.length || 0})</h4>
                                        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                          {(o.items || []).map((it, idx) => (
                                            <div key={idx} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,.02)' }}>
                                              {it.image && <img src={it.image} alt={it.name} style={{ width:36, height:36, borderRadius:8, objectFit:'cover' }} />}
                                              <div style={{ flex:1 }}>
                                                <p style={{ fontSize:12, color:'#fff', margin:0, fontWeight:600 }}>{it.name}</p>
                                                <p style={{ fontSize:11, color:'rgba(167,139,250,.5)', margin:0 }}>Qty {it.qty} × Rs.{it.price}</p>
                                              </div>
                                              <span style={{ fontSize:12, color:'#fbbf24', fontWeight:700 }}>Rs.{(it.qty * it.price).toLocaleString()}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 style={{ fontSize:12, fontWeight:800, color:'#c4b5fd', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'.08em' }}>Summary</h4>
                                        <div className="ud-row" style={{ fontSize:12 }}><span style={{ color:'rgba(196,181,253,.55)' }}>Subtotal</span><span style={{ color:'#fff' }}>Rs.{o.totalAmount?.toLocaleString()}</span></div>
                                        <div className="ud-row" style={{ fontSize:12 }}><span style={{ color:'rgba(196,181,253,.55)' }}>Voucher</span><span style={{ color:'#34d399' }}>− Rs.{o.discountAmount || 0}</span></div>
                                        <div className="ud-row" style={{ fontSize:12 }}><span style={{ color:'rgba(196,181,253,.55)' }}>Points used</span><span style={{ color:'#34d399' }}>− {o.pointsUsed || 0} pts</span></div>
                                        <div className="ud-row" style={{ fontSize:13, fontWeight:800 }}><span style={{ color:'#fff' }}>Net total</span><span style={{ color:'#fbbf24' }}>Rs.{o.netAmount?.toLocaleString()}</span></div>
                                        {o.shippingAddress && (
                                          <div style={{ marginTop:12, padding:'10px 12px', borderRadius:10, background:'rgba(124,58,237,.06)', border:'1px solid rgba(167,139,250,.12)' }}>
                                            <p style={{ fontSize:10, color:'rgba(167,139,250,.5)', textTransform:'uppercase', letterSpacing:'.08em', margin:'0 0 4px', fontWeight:700 }}>Shipping</p>
                                            <p style={{ fontSize:12, color:'rgba(196,181,253,.7)', margin:0, lineHeight:1.5 }}>
                                              {o.shippingAddress.fullName}<br/>
                                              {o.shippingAddress.address}, {o.shippingAddress.city}<br/>
                                              {o.shippingAddress.state} {o.shippingAddress.pincode}<br/>
                                              {o.shippingAddress.phone}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* WALLET */}
            {section === 'wallet' && (
              <>
                <div className="ud-sect-hdr">
                  <Wallet style={{ width:22, height:22, color:'#a78bfa' }} />
                  <h2>Wallet</h2>
                </div>

                <div className="ud-two-col" style={{ display:'grid', gridTemplateColumns:'1fr', gap:18, marginBottom:18, maxWidth:560 }}>
                  {/* Balance + withdraw form */}
                  <div className="ud-glass" style={{ padding:24 }}>
                    <h3 style={{ fontSize:13, fontWeight:800, color:'rgba(167,139,250,.6)', textTransform:'uppercase', letterSpacing:'.08em', margin:'0 0 6px' }}>Available Balance</h3>
                    <div style={{ fontSize:38, fontWeight:900, color:'#a78bfa', lineHeight:1, marginBottom:4, textShadow:'0 0 30px rgba(167,139,250,.4)' }}>{user?.walletPoints || 0}</div>
                    <div style={{ color:'rgba(167,139,250,.5)', fontSize:13, marginBottom:22 }}>points · 1 pt = Rs.1</div>

                    <h3 style={{ fontSize:13, fontWeight:800, color:'#c4b5fd', margin:'0 0 12px' }}>Request Withdrawal</h3>
                    <form onSubmit={submitWithdraw} style={{ display:'flex', flexDirection:'column', gap:11 }}>
                      <input type="number" placeholder="Points to withdraw (min 100)" className="ud-input" value={withdraw.points} onChange={e => setWithdraw({...withdraw, points:e.target.value})} />
                      <select className="ud-input" value={withdraw.method} onChange={e => setWithdraw({...withdraw, method:e.target.value})}>
                        <option value="upi">UPI / JazzCash</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                      {withdraw.method === 'upi' ? (
                        <input type="text" placeholder="UPI ID / Phone Number" className="ud-input" value={withdraw.upiId} onChange={e => setWithdraw({...withdraw, upiId:e.target.value})} />
                      ) : (
                        <>
                          <input type="text" placeholder="Bank name"      className="ud-input" value={withdraw.bankName}      onChange={e => setWithdraw({...withdraw, bankName:e.target.value})} />
                          <input type="text" placeholder="Account number" className="ud-input" value={withdraw.accountNumber} onChange={e => setWithdraw({...withdraw, accountNumber:e.target.value})} />
                          <input type="text" placeholder="IFSC code"      className="ud-input" value={withdraw.ifsc}          onChange={e => setWithdraw({...withdraw, ifsc:e.target.value})} />
                        </>
                      )}
                      <button type="submit" disabled={wSubmitting} className="ud-btn ud-btn-gold" style={{ justifyContent:'center', marginTop:4 }}>
                        {wSubmitting ? 'Submitting…' : 'Submit Request'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Transactions */}
                <div className="ud-glass" style={{ padding:0, overflow:'hidden' }}>
                  <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(167,139,250,.1)' }}>
                    <h3 style={{ fontSize:14, fontWeight:800, color:'#c4b5fd', margin:0 }}>Transactions</h3>
                  </div>
                  {transactions.length === 0 ? (
                    <div style={{ padding:40, textAlign:'center', color:'rgba(167,139,250,.4)', fontSize:13 }}>No transactions yet</div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse' }}>
                        <thead>
                          <tr style={{ background:'rgba(124,58,237,.08)' }}>
                            {['Date','Type','Description','Amount'].map(h => (
                              <th key={h} style={{ padding:'12px 18px', fontSize:11, fontWeight:700, color:'rgba(167,139,250,.65)', textTransform:'uppercase', letterSpacing:'.08em', textAlign:'left' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.slice(0,30).map(t => (
                            <tr key={t._id} style={{ borderBottom:'1px solid rgba(167,139,250,.06)' }}>
                              <td style={{ padding:'10px 18px', fontSize:12, color:'rgba(196,181,253,.5)' }}>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                              <td style={{ padding:'10px 18px' }}>
                                <span className="ud-pill" style={{ color: t.type==='credit' ? '#34d399' : '#f87171', background: t.type==='credit' ? 'rgba(52,211,153,.1)' : 'rgba(248,113,113,.1)', borderColor: t.type==='credit' ? 'rgba(52,211,153,.3)' : 'rgba(248,113,113,.3)' }}>{t.type}</span>
                              </td>
                              <td style={{ padding:'10px 18px', fontSize:13, color:'rgba(196,181,253,.7)' }}>{t.description || t.reason || '—'}</td>
                              <td style={{ padding:'10px 18px', fontSize:13, fontWeight:800, color: t.type==='credit' ? '#34d399' : '#f87171' }}>{t.type==='credit' ? '+' : '-'}{t.points} pts</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* VOUCHERS */}
            {section === 'vouchers' && (
              <>
                <div className="ud-sect-hdr">
                  <Gift style={{ width:22, height:22, color:'#fbbf24' }} />
                  <h2>Vouchers</h2>
                </div>
                <div className="ud-glass" style={{ padding:32, maxWidth:520, borderColor:'rgba(251,191,36,.3)', background:'linear-gradient(150deg,rgba(251,191,36,.08),rgba(124,58,237,.04))' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                    <div style={{ width:52, height:52, borderRadius:14, background:'rgba(251,191,36,.18)', border:'1.5px solid rgba(251,191,36,.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Gift style={{ width:26, height:26, color:'#fbbf24' }} />
                    </div>
                    <div>
                      <p style={{ color:'#fbbf24', fontWeight:900, fontSize:18, margin:'0 0 3px' }}>Welcome Voucher</p>
                      <p style={{ color:'rgba(251,191,36,.55)', fontSize:12, margin:0 }}>Sign-up bonus for new customers</p>
                    </div>
                  </div>
                  <div className="ud-row"><span style={{ color:'rgba(196,181,253,.55)' }}>Total amount</span><span style={{ color:'#fff', fontWeight:700 }}>Rs.{user?.welcomeVoucher?.amount || 0}</span></div>
                  <div className="ud-row"><span style={{ color:'rgba(196,181,253,.55)' }}>Used so far</span><span style={{ color:'#f87171', fontWeight:700 }}>Rs.{user?.welcomeVoucher?.used || 0}</span></div>
                  <div className="ud-row"><span style={{ color:'rgba(196,181,253,.55)' }}>Remaining</span><span style={{ color:'#34d399', fontWeight:800 }}>Rs.{voucherBalance}</span></div>
                  <div className="ud-row"><span style={{ color:'rgba(196,181,253,.55)' }}>Discount per product</span><span style={{ color:'#fbbf24', fontWeight:700 }}>20% (auto-applied)</span></div>
                  <Link to="/shop" className="ud-btn ud-btn-gold" style={{ textDecoration:'none', justifyContent:'center', width:'100%', marginTop:18 }}>
                    Use Voucher — Shop Now <ArrowRight style={{ width:14, height:14 }} />
                  </Link>
                </div>
              </>
            )}

            {/* REFERRALS */}
            {section === 'referrals' && (
              <>
                <div className="ud-sect-hdr">
                  <Users style={{ width:22, height:22, color:'#34d399' }} />
                  <h2>Referrals</h2>
                </div>

                <div className="ud-two-col" style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:18 }}>
                  <div className="ud-glass" style={{ padding:24 }}>
                    <h3 style={{ fontSize:13, fontWeight:800, color:'rgba(167,139,250,.6)', textTransform:'uppercase', letterSpacing:'.08em', margin:'0 0 12px' }}>Your Referral Link</h3>
                    {referralLink?.link ? (
                      <>
                        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                          <input className="ud-input" readOnly value={referralLink.link} style={{ fontFamily:'monospace', fontSize:12 }} />
                          <button onClick={copyRefLink} className="ud-btn ud-btn-primary" style={{ flexShrink:0 }}>
                            {copied ? <CheckCircle style={{ width:14, height:14 }} /> : <Copy style={{ width:14, height:14 }} />}
                            {copied ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p style={{ color:'rgba(167,139,250,.55)', fontSize:12, margin:0 }}>Share this with friends — earn 10% commission on their first purchase, then 5% / 3% / 2% / 1% across 4 deeper levels.</p>
                      </>
                    ) : (
                      <div className="ud-skel" style={{ height:46 }} />
                    )}
                  </div>

                  <div className="ud-glass" style={{ padding:24 }}>
                    <h3 style={{ fontSize:13, fontWeight:800, color:'rgba(167,139,250,.6)', textTransform:'uppercase', letterSpacing:'.08em', margin:'0 0 6px' }}>Total Earnings</h3>
                    <div style={{ fontSize:32, fontWeight:900, color:'#34d399', lineHeight:1, marginBottom:4, textShadow:'0 0 30px rgba(52,211,153,.4)' }}>Rs.{referralEarnings.toLocaleString()}</div>
                    <div style={{ color:'rgba(52,211,153,.55)', fontSize:13 }}>credited to wallet</div>
                  </div>
                </div>

                <div className="ud-glass" style={{ padding:24, marginTop:18 }}>
                  <h3 style={{ fontSize:14, fontWeight:800, color:'#c4b5fd', margin:'0 0 16px' }}>My Network</h3>
                  {referralNetwork && Array.isArray(referralNetwork.levels) && referralNetwork.levels.length > 0 ? (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
                      {referralNetwork.levels.map((lvl, i) => (
                        <div key={i} style={{ padding:'14px 12px', borderRadius:14, background:'rgba(124,58,237,.08)', border:'1px solid rgba(167,139,250,.18)', textAlign:'center' }}>
                          <div style={{ fontSize:11, color:'rgba(167,139,250,.55)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>Level {i+1}</div>
                          <div style={{ fontSize:22, fontWeight:900, color:'#a78bfa' }}>{lvl.count || 0}</div>
                          <div style={{ fontSize:11, color:'rgba(196,181,253,.45)' }}>members</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color:'rgba(167,139,250,.4)', fontSize:13, margin:0, textAlign:'center', padding:'20px 0' }}>No referrals yet — share your link to start earning.</p>
                  )}
                </div>
              </>
            )}

            {/* PROFILE */}
            {section === 'profile' && (
              <>
                <div className="ud-sect-hdr">
                  <User style={{ width:22, height:22, color:'#a78bfa' }} />
                  <h2>Profile</h2>
                </div>
                <div className="ud-glass" style={{ padding:28, maxWidth:520 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, paddingBottom:20, borderBottom:'1px solid rgba(167,139,250,.1)' }}>
                    <div style={{ width:60, height:60, borderRadius:99, background:'linear-gradient(135deg,rgba(124,58,237,.3),rgba(167,139,250,.2))', border:'2px solid rgba(167,139,250,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:900, color:'#a78bfa', flexShrink:0 }}>
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ color:'#fff', fontWeight:900, fontSize:18, margin:'0 0 3px' }}>{user?.name}</p>
                      <p style={{ color:'rgba(196,181,253,.5)', fontSize:12, margin:0 }}>{user?.email}</p>
                    </div>
                  </div>
                  <div className="ud-row"><span style={{ color:'rgba(196,181,253,.5)' }}>Phone</span><span style={{ color:'#fff', fontWeight:700 }}>{user?.phone || '—'}</span></div>
                  <div className="ud-row"><span style={{ color:'rgba(196,181,253,.5)' }}>Account type</span><span style={{ color:'#a78bfa', fontWeight:700 }}>Customer</span></div>
                  <div className="ud-row"><span style={{ color:'rgba(196,181,253,.5)' }}>Wallet balance</span><span style={{ color:'#a78bfa', fontWeight:700 }}>{user?.walletPoints || 0} pts</span></div>
                  <div className="ud-row"><span style={{ color:'rgba(196,181,253,.5)' }}>Welcome voucher</span><span style={{ color:'#fbbf24', fontWeight:700 }}>Rs.{voucherBalance} remaining</span></div>
                  <div className="ud-row"><span style={{ color:'rgba(196,181,253,.5)' }}>Member since</span><span style={{ color:'rgba(196,181,253,.7)', fontSize:12 }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}</span></div>
                  <Link to="/agent/register" className="ud-btn ud-btn-gold" style={{ textDecoration:'none', justifyContent:'center', width:'100%', marginTop:18 }}>
                    <Crown style={{ width:14, height:14 }} /> Become a Sales Agent
                  </Link>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
