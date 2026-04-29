import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, Menu, X, LayoutDashboard, Users, Crown, ShoppingBag } from 'lucide-react';
import useAuthStore from '../store/authStore.js';
import useCartStore from '../store/cartStore.js';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const cartItems = useCartStore(s => s.items);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const NAV_LINKS = [
    { label: 'Shop',   path: '/shop'      },
    { label: 'Sarees', path: '/shop/saree'},
    { label: 'Suits',  path: '/shop/suit' },
    { label: 'Kurtas', path: '/shop/kurta'},
  ];
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <style>{`
        .nav-root {
          position:sticky; top:0; z-index:100;
          background: ${scrolled
            ? 'linear-gradient(180deg,rgba(5,0,16,.92) 0%,rgba(5,0,16,.82) 100%)'
            : 'linear-gradient(180deg,rgba(5,0,16,.75) 0%,rgba(5,0,16,.55) 100%)'};
          backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
          border-bottom:1px solid rgba(167,139,250,.14);
          transition:background .3s;
          box-shadow:${scrolled ? '0 8px 40px rgba(0,0,0,.55)' : 'none'};
        }
        .nav-inner { max-width:1200px; margin:0 auto; padding:0 20px; height:62px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .nav-logo { display:flex; align-items:baseline; gap:6px; text-decoration:none; }
        .nav-logo .gmt  { font-weight:900; font-size:1.25rem; background:linear-gradient(135deg,#fffde7,#fbbf24,#f97316); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; filter:drop-shadow(0 0 10px rgba(251,191,36,.6)); }
        .nav-logo .mart { font-weight:900; font-size:1.25rem; background:linear-gradient(135deg,#f0e6ff,#a78bfa,#7c3aed); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .nav-links { display:flex; align-items:center; gap:2px; }
        .nav-link { padding:7px 13px; border-radius:10px; font-size:13px; font-weight:600; color:rgba(196,181,253,.7); text-decoration:none; transition:color .18s,background .18s; }
        .nav-link:hover { color:#c4b5fd; background:rgba(124,58,237,.12); }
        .nav-link.active { color:#c4b5fd; background:rgba(124,58,237,.18); border:1px solid rgba(167,139,250,.2); }
        .nav-right { display:flex; align-items:center; gap:6px; }
        .nav-icon-btn { width:38px; height:38px; border-radius:11px; background:rgba(255,255,255,.04); border:1px solid rgba(167,139,250,.14); display:flex; align-items:center; justify-content:center; color:rgba(196,181,253,.7); cursor:pointer; transition:all .18s; text-decoration:none; }
        .nav-icon-btn:hover { background:rgba(124,58,237,.15); border-color:rgba(167,139,250,.35); color:#c4b5fd; }
        .nav-cart-count { position:absolute; top:-5px; right:-5px; width:18px; height:18px; border-radius:99px; background:linear-gradient(135deg,#fbbf24,#f97316); color:#1a0a00; font-size:10px; font-weight:900; display:flex; align-items:center; justify-content:center; }
        .nav-avatar { width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,rgba(124,58,237,.4),rgba(167,139,250,.3)); border:1.5px solid rgba(167,139,250,.35); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:14px; color:#c4b5fd; }
        .nav-btn-login { padding:7px 16px; border-radius:11px; background:rgba(167,139,250,.1); border:1.5px solid rgba(167,139,250,.3); color:#a78bfa; font-size:13px; font-weight:700; text-decoration:none; transition:all .18s; }
        .nav-btn-login:hover { background:rgba(167,139,250,.18); border-color:#a78bfa; color:#c4b5fd; }
        .nav-btn-reg { padding:7px 16px; border-radius:11px; background:linear-gradient(135deg,#fde68a,#fbbf24,#f97316); color:#1a0a00; font-size:13px; font-weight:800; text-decoration:none; box-shadow:0 4px 18px rgba(251,191,36,.4); transition:filter .18s,transform .15s; }
        .nav-btn-reg:hover { filter:brightness(1.1); transform:translateY(-1px); }
        .nav-agent-pill { display:flex; align-items:center; gap:5px; padding:6px 12px; border-radius:10px; background:rgba(251,191,36,.1); border:1px solid rgba(251,191,36,.28); color:#fbbf24; font-size:12px; font-weight:700; text-decoration:none; transition:all .18s; }
        .nav-agent-pill:hover { background:rgba(251,191,36,.18); border-color:rgba(251,191,36,.5); }
        .mobile-menu { background:linear-gradient(180deg,rgba(5,0,14,.97) 0%,rgba(10,0,20,.97) 100%); border-bottom:1px solid rgba(167,139,250,.12); backdrop-filter:blur(24px); overflow:hidden; }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
        .mobile-menu-inner { padding:16px 20px 20px; animation:slideDown .2s ease-out; }
      `}</style>

      <header className="nav-root">
        <div className="nav-inner">

          {/* Logo */}
          <Link to="/" className="nav-logo">
            <span className="gmt">GMT</span>
            <span className="mart">MART</span>
          </Link>

          {/* Desktop nav links — hide for admin */}
          {!isAdmin && (
            <nav className="nav-links" style={{ display:'flex' }}>
              {NAV_LINKS.map(n => (
                <NavLink key={n.path} to={n.path} end={n.path==='/shop'}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  {n.label}
                </NavLink>
              ))}
            </nav>
          )}
          {isAdmin && (
            <nav className="nav-links" style={{ display:'flex' }}>
              <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Admin Panel</NavLink>
            </nav>
          )}

          {/* Right side */}
          <div className="nav-right">

            {/* Cart — hide for admin */}
            {!isAdmin && (
              <Link to="/cart" className="nav-icon-btn" style={{ position:'relative' }}>
                <ShoppingBag style={{ width:18, height:18 }} />
                {cartCount > 0 && <span className="nav-cart-count">{cartCount}</span>}
              </Link>
            )}

            {user ? (
              <>
                {/* Agent pill */}
                {user.isAgent && (
                  <Link to="/agent" className="nav-agent-pill" style={{ display:'none' }} id="agent-pill-desktop">
                    <Crown style={{ width:13, height:13 }} /> Agent
                  </Link>
                )}

                {/* Dashboard — admin goes to /admin, others to /dashboard */}
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="nav-icon-btn" title={isAdmin ? 'Admin Panel' : 'Dashboard'}>
                  <LayoutDashboard style={{ width:17, height:17 }} />
                </Link>

                {user.isAgent && (
                  <Link to="/agent" className="nav-icon-btn" title="Agent Panel" style={{ borderColor:'rgba(251,191,36,.3)', color:'#fbbf24' }}>
                    <Crown style={{ width:17, height:17 }} />
                  </Link>
                )}

                {/* Logout */}
                <button onClick={() => { logout(); navigate('/'); }} className="nav-icon-btn"
                  style={{ background:'transparent', border:'1px solid rgba(248,113,113,.2)', color:'rgba(248,113,113,.7)' }}
                  title="Logout">
                  <LogOut style={{ width:16, height:16 }} />
                </button>

                {/* Avatar */}
                <div className="nav-avatar" style={{ display:'flex' }}>
                  {user.name[0].toUpperCase()}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn-login">Sign In</Link>
                <Link to="/agent/register" className="nav-btn-reg">Become Agent</Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button className="nav-icon-btn" style={{ display:'none', marginLeft:4 }} id="nav-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X style={{ width:18, height:18 }} /> : <Menu style={{ width:18, height:18 }} />}
            </button>
          </div>
        </div>

          {/* Mobile menu — hide shop links for admin */}
          {menuOpen && (
            <div className="mobile-menu">
              <div className="mobile-menu-inner">
                {!isAdmin && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                    {NAV_LINKS.map(n => (
                      <Link key={n.path} to={n.path}
                        style={{ padding:'10px 14px', borderRadius:12, background:'rgba(124,58,237,.1)', border:'1px solid rgba(167,139,250,.18)', color:'rgba(196,181,253,.8)', fontSize:13, fontWeight:600, textDecoration:'none' }}>
                        {n.label}
                      </Link>
                    ))}
                  </div>
                )}
              {!user ? (
                <div style={{ display:'flex', gap:8 }}>
                  <Link to="/login"          style={{ flex:1, textAlign:'center', padding:'11px', borderRadius:12, background:'rgba(167,139,250,.1)', border:'1.5px solid rgba(167,139,250,.3)', color:'#a78bfa', fontWeight:700, textDecoration:'none', fontSize:13 }}>Sign In</Link>
                  <Link to="/agent/register" style={{ flex:1, textAlign:'center', padding:'11px', borderRadius:12, background:'linear-gradient(135deg,#fde68a,#fbbf24,#f97316)', color:'#1a0a00', fontWeight:800, textDecoration:'none', fontSize:13 }}>Become Agent</Link>
                </div>
              ) : (
                <div style={{ display:'flex', gap:8 }}>
                  <Link to={isAdmin ? '/admin' : '/dashboard'} style={{ flex:1, textAlign:'center', padding:'10px', borderRadius:12, background:'rgba(124,58,237,.12)', border:'1px solid rgba(167,139,250,.2)', color:'#a78bfa', fontWeight:700, textDecoration:'none', fontSize:13 }}>{isAdmin ? 'Admin Panel' : 'Dashboard'}</Link>
                  {!isAdmin && user.isAgent && <Link to="/agent" style={{ padding:'10px 16px', borderRadius:12, background:'rgba(251,191,36,.1)', border:'1px solid rgba(251,191,36,.28)', color:'#fbbf24', fontWeight:700, textDecoration:'none', fontSize:13 }}>Agent</Link>}
                  <button onClick={() => { logout(); navigate('/'); }} style={{ padding:'10px 14px', borderRadius:12, background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.25)', color:'#f87171', fontWeight:700, fontSize:13, cursor:'pointer' }}>Logout</button>
                </div>
              )}
              </div>
            </div>
          )}

        <style>{`
          @media (max-width: 768px) {
            .nav-links { display:none !important; }
            #nav-hamburger { display:flex !important; }
            .nav-btn-login, .nav-btn-reg { display:none; }
          }
          @media (min-width: 769px) {
            #nav-hamburger { display:none !important; }
          }
        `}</style>
      </header>
    </>
  );
}
