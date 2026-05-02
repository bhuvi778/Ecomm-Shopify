import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Crown, CheckCircle } from 'lucide-react';
import { gsap } from 'gsap';
import useAuthStore from '../store/authStore.js';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', referralCode: refCode });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referrer, setReferrer] = useState(null); // agent info if ref valid

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const cardRef = useRef();

  // Animate card in
  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 60, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' }
    );
  }, []);

  // If ref param exists, try to lookup agent name for display
  useEffect(() => {
    if (!refCode) return;
    api.get(`/auth/referrer?code=${refCode}`)
      .then(r => setReferrer(r.data))
      .catch(() => {}); // silently fail if endpoint doesn't exist yet
  }, [refCode]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const { name, email, phone, password, referralCode } = form;
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password, referralCode: referralCode.trim() || undefined });
      setAuth(data.token, data.user);
      toast.success('Account created! Welcome to GMT Mart 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .su-bg { min-height:100vh; background:radial-gradient(ellipse at 70% 20%,#0d1a40 0%,#050010 45%,#000305 100%); display:flex; align-items:center; justify-content:center; padding:24px 16px; position:relative; overflow:hidden; }
        .su-grid { position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size:44px 44px; }
        @keyframes suBlob { 0%,100%{transform:translate(0,0) scale(1);opacity:.5;}50%{transform:translate(-3%,5%) scale(1.07);opacity:.65;} }
        .su-blob { animation:suBlob var(--d,18s) ease-in-out infinite; position:absolute; border-radius:50%; pointer-events:none; }
        .su-card { background:linear-gradient(150deg,rgba(255,255,255,.044) 0%,rgba(99,102,241,.055) 50%,rgba(16,185,129,.025) 100%); border:1px solid rgba(167,139,250,.2); backdrop-filter:blur(32px); -webkit-backdrop-filter:blur(32px); border-radius:28px; box-shadow:0 32px 96px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.1); padding:40px 36px 36px; width:100%; max-width:440px; position:relative; z-index:10; }
        .su-input { width:100%; padding:12px 16px; border-radius:12px; background:rgba(255,255,255,.05); border:1.5px solid rgba(167,139,250,.2); color:#fff; font-size:14px; outline:none; transition:border-color .2s; box-sizing:border-box; }
        .su-input:focus { border-color:rgba(167,139,250,.6); background:rgba(124,58,237,.08); }
        .su-input::placeholder { color:rgba(167,139,250,.35); }
        .su-label { display:block; color:rgba(196,181,253,.55); font-size:11.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; margin-bottom:5px; }
        .su-btn { width:100%; padding:14px; border-radius:14px; background:linear-gradient(135deg,#7c3aed,#6d28d9,#4c1d95); border:none; color:#fff; font-size:15px; font-weight:800; cursor:pointer; letter-spacing:.02em; transition:opacity .2s,transform .15s; }
        .su-btn:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
        .su-btn:disabled { opacity:.55; cursor:not-allowed; transform:none; }
        .su-ref-banner { display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:14px; background:rgba(251,191,36,.08); border:1px solid rgba(251,191,36,.28); margin-bottom:20px; }
        .su-field { margin-bottom:18px; position:relative; }
        .su-pw-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:rgba(167,139,250,.5); cursor:pointer; padding:4px; display:flex; }
        .su-pw-eye:hover { color:rgba(167,139,250,.9); }
      `}</style>
      <div className="su-bg">
        <div className="su-grid" />
        {[
          { c: 'rgba(99,102,241,.28)',  w: 500, t: '-8%',  l: '-10%', d: '18s' },
          { c: 'rgba(16,185,129,.20)',  w: 400, b: '-6%',  l: '5%',   d: '22s' },
          { c: 'rgba(251,191,36,.16)',  w: 380, t: '-5%',  r: '-8%',  d: '15s' },
        ].map((b, i) => (
          <div key={i} className="su-blob" style={{ '--d': b.d, width: b.w, height: b.w, background: `radial-gradient(circle,${b.c},transparent 70%)`, top: b.t, left: b.l, right: b.r, bottom: b.b, filter: 'blur(72px)' }} />
        ))}

        <div ref={cardRef} className="su-card" style={{ opacity: 0 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 15, background: 'linear-gradient(135deg,#7c3aed,#4c1d95)', boxShadow: '0 0 26px rgba(124,58,237,.7)', marginBottom: 12 }}>
              <UserPlus style={{ width: 24, height: 24, color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 7, marginBottom: 3 }}>
              <span style={{ fontWeight: 900, fontSize: 20, background: 'linear-gradient(135deg,#fffde7,#fbbf24,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>GMT</span>
              <span style={{ fontWeight: 900, fontSize: 20, background: 'linear-gradient(135deg,#f0e6ff,#a78bfa,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>MART</span>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>Create Account</h1>
            <p style={{ color: 'rgba(196,181,253,.55)', fontSize: 12.5, margin: 0 }}>Join GMT Mart and get ₹1000 welcome bonus</p>
          </div>

          {/* Referral banner - shows only when ref code exists */}
          {refCode && (
            <div className="su-ref-banner">
              <CheckCircle style={{ width: 20, height: 20, color: '#fbbf24', flexShrink: 0 }} />
              <div>
                <p style={{ color: '#fbbf24', fontWeight: 800, fontSize: 13, margin: '0 0 2px' }}>
                  {referrer ? `Referred by ${referrer.name}` : 'Referral link active!'}
                </p>
                <p style={{ color: 'rgba(251,191,36,.6)', fontSize: 11.5, margin: 0 }}>
                  You'll be added to their referral network automatically
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="su-field">
              <label className="su-label">Full Name *</label>
              <input name="name" className="su-input" placeholder="Enter your full name" value={form.name} onChange={handleChange} required />
            </div>

            {/* Email */}
            <div className="su-field">
              <label className="su-label">Email Address *</label>
              <input name="email" type="email" className="su-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>

            {/* Phone */}
            <div className="su-field">
              <label className="su-label">Phone Number *</label>
              <input name="phone" type="tel" className="su-input" placeholder="9876543210" value={form.phone} onChange={handleChange} required />
            </div>

            {/* Password */}
            <div className="su-field">
              <label className="su-label">Password *</label>
              <input name="password" type={showPw ? 'text' : 'password'} className="su-input" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} style={{ paddingRight: 40 }} required />
              <button type="button" className="su-pw-eye" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>

            {/* Referral code (read-only if from URL, editable otherwise) */}
            <div className="su-field">
              <label className="su-label">Referral Code <span style={{ color: 'rgba(167,139,250,.4)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input
                name="referralCode"
                className="su-input"
                placeholder="Agent ID / referral code"
                value={form.referralCode}
                onChange={handleChange}
                style={refCode ? { color: '#fbbf24', background: 'rgba(251,191,36,.06)', borderColor: 'rgba(251,191,36,.3)' } : {}}
                readOnly={!!refCode}
              />
            </div>

            <button type="submit" className="su-btn" disabled={loading}>
              {loading ? 'Creating Account…' : 'Create My Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12.5, color: 'rgba(167,139,250,.45)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'rgba(167,139,250,.35)' }}>
            Want to earn more?{' '}
            <Link to="/agent/register" style={{ color: 'rgba(251,191,36,.7)', fontWeight: 700, textDecoration: 'none' }}>Become a Sales Agent</Link>
          </p>
        </div>
      </div>
    </>
  );
}
