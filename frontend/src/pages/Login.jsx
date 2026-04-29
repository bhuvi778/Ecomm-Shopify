import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShoppingBag, Crown } from "lucide-react";
import useAuthStore from "../store/authStore.js";
import toast from "react-hot-toast";
import { gsap } from "gsap";

export default function Login() {
  const [form, setForm]     = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const { login, loading }  = useAuthStore();
  const navigate            = useNavigate();
  const [params]            = useSearchParams();
  const redirect            = params.get("redirect") || "/dashboard";
  const cardRef  = useRef();
  const titleRef = useRef();

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 60, opacity: 0, scale: 0.96 },
      { y: 0,  opacity: 1, scale: 1, duration: 0.75, ease: "expo.out" }
    );
    gsap.fromTo(titleRef.current,
      { y: 30, opacity: 0 },
      { y: 0,  opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.15 }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate(redirect);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <style>{`
        .auth-bg { min-height:100vh; background:radial-gradient(ellipse at 30% 20%,#1a0533 0%,#050010 42%,#000510 70%,#000305 100%); display:flex; align-items:center; justify-content:center; padding:24px 16px; position:relative; overflow:hidden; }
        .auth-grid { position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(124,58,237,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,.07) 1px,transparent 1px); background-size:44px 44px; }
        @keyframes authAurora { 0%,100%{transform:translate(0,0) scale(1);opacity:.5;}50%{transform:translate(5%,-8%) scale(1.1);opacity:.7;} }
        .auth-blob { animation:authAurora var(--d,18s) ease-in-out infinite; position:absolute; border-radius:50%; pointer-events:none; }
        .auth-card { background:linear-gradient(150deg,rgba(255,255,255,.044) 0%,rgba(124,58,237,.055) 50%,rgba(6,182,212,.025) 100%); border:1px solid rgba(167,139,250,.2); backdrop-filter:blur(32px); -webkit-backdrop-filter:blur(32px); border-radius:24px; box-shadow:0 32px 96px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(124,58,237,.12),0 0 80px rgba(124,58,237,.08); padding:44px 40px; width:100%; max-width:420px; position:relative; z-index:10; }
        .auth-input { width:100%; background:rgba(255,255,255,.055); border:1px solid rgba(167,139,250,.25); border-radius:12px; padding:12px 12px 12px 40px; color:#fff; font-size:14px; outline:none; transition:border-color .2s,background .2s,box-shadow .2s; }
        .auth-input:focus { border-color:rgba(167,139,250,.65); background:rgba(255,255,255,.08); box-shadow:0 0 0 3px rgba(124,58,237,.18); }
        .auth-input::placeholder { color:rgba(167,139,250,.4); }
        .auth-label { display:block; font-size:12px; font-weight:600; color:rgba(196,181,253,.85); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.08em; }
        .btn-auth-gold { width:100%; padding:14px; border-radius:14px; background:linear-gradient(135deg,#fde68a 0%,#fbbf24 45%,#f97316 100%); color:#1a0a00; font-weight:900; font-size:15px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 0 0 2px rgba(251,191,36,.35),0 8px 32px rgba(251,191,36,.45),inset 0 1px 0 rgba(255,255,255,.3); transition:filter .2s,transform .15s; }
        .btn-auth-gold:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); }
        .btn-auth-gold:disabled { opacity:.6; cursor:not-allowed; }
        .auth-link { color:#a78bfa; text-decoration:none; font-weight:700; transition:color .2s; }
        .auth-link:hover { color:#fbbf24; }
        @keyframes scanLine { 0%{top:-2%;}100%{top:102%;} }
        .auth-scan { animation:scanLine 9s linear infinite; position:absolute; left:0; right:0; height:1.5px; pointer-events:none; z-index:1; background:linear-gradient(90deg,transparent,rgba(167,139,250,.35),rgba(167,139,250,.6),rgba(167,139,250,.35),transparent); }
      `}</style>
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-scan" />
        {[
          { c:"rgba(124,58,237,.28)", w:500, t:"-10%", l:"-12%", d:"18s" },
          { c:"rgba(236,72,153,.22)", w:400, t:"-5%",  r:"-10%",  d:"13s" },
          { c:"rgba(6,182,212,.18)",  w:380, b:"-8%",  l:"5%",   d:"22s" },
          { c:"rgba(251,191,36,.14)", w:320, b:"-5%",  r:"5%",   d:"16s" },
        ].map((b,i) => (
          <div key={i} className="auth-blob" style={{ "--d":b.d, width:b.w, height:b.w, background:`radial-gradient(circle,${b.c},transparent 70%)`, top:b.t, left:b.l, right:b.r, bottom:b.b, filter:"blur(70px)" }} />
        ))}
        <div ref={cardRef} className="auth-card">
          <div ref={titleRef} style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#7c3aed,#4c1d95)", boxShadow:"0 0 28px rgba(124,58,237,.7)", marginBottom:14 }}>
              <ShoppingBag style={{ width:26, height:26, color:"#fff" }} />
            </div>
            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:8, marginBottom:4 }}>
              <span style={{ fontWeight:900, fontSize:22, background:"linear-gradient(135deg,#fffde7,#fbbf24,#f97316)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", filter:"drop-shadow(0 0 12px rgba(251,191,36,.7))" }}>GMT</span>
              <span style={{ fontWeight:900, fontSize:22, background:"linear-gradient(135deg,#f0e6ff,#a78bfa,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>MART</span>
            </div>
            <h1 style={{ fontSize:20, fontWeight:900, color:"#fff", margin:"4px 0 6px" }}>Welcome Back</h1>
            <p style={{ color:"rgba(196,181,253,.7)", fontSize:13, margin:0 }}>Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div>
              <label className="auth-label">Email Address</label>
              <div style={{ position:"relative" }}>
                <Mail style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", width:16, height:16, color:"rgba(167,139,250,.55)", pointerEvents:"none" }} />
                <input type="email" className="auth-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
              </div>
            </div>
            <div>
              <label className="auth-label">Password</label>
              <div style={{ position:"relative" }}>
                <Lock style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", width:16, height:16, color:"rgba(167,139,250,.55)", pointerEvents:"none" }} />
                <input type={showPw ? "text" : "password"} className="auth-input" style={{ paddingRight:40 }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(167,139,250,.55)", padding:0, display:"flex" }}>
                  {showPw ? <EyeOff style={{ width:16, height:16 }} /> : <Eye style={{ width:16, height:16 }} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-auth-gold">
              {loading ? "Signing in…" : "Sign In"} <ArrowRight style={{ width:17, height:17 }} />
            </button>
          </form>
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"22px 0 18px" }}>
            <div style={{ flex:1, height:1, background:"rgba(167,139,250,.18)" }} />
            <span style={{ color:"rgba(167,139,250,.45)", fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>or</span>
            <div style={{ flex:1, height:1, background:"rgba(167,139,250,.18)" }} />
          </div>
          <div style={{ textAlign:"center" }}>
            <p style={{ color:"rgba(196,181,253,.7)", fontSize:13, marginBottom:10 }}>Don't have an account?</p>
            <Link to="/agent/register" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"13px 20px", borderRadius:14, background:"linear-gradient(135deg,rgba(251,191,36,.14),rgba(249,115,22,.1))", border:"1.5px solid rgba(251,191,36,.4)", color:"#fbbf24", fontWeight:700, fontSize:14, textDecoration:"none", backdropFilter:"blur(12px)" }}>
              <Crown style={{ width:16, height:16 }} />
              Become a Sales Agent
              <ArrowRight style={{ width:16, height:16 }} />
            </Link>
          </div>
          <div style={{ marginTop:20, padding:"12px 14px", borderRadius:12, background:"rgba(0,0,0,.45)", border:"1px solid rgba(255,255,255,.06)" }}>
            <p style={{ fontSize:10, fontWeight:700, color:"rgba(167,139,250,.65)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Demo Accounts</p>
            {[
              { role:"Customer", email:"rahul@example.com",          pw:"Password@123" },
              { role:"Agent",    email:"vikram@example.com",         pw:"Password@123" },
              { role:"Admin",    email:"admin@maalkechalo.com",      pw:"Password@123" },
            ].map(d => (
              <div key={d.role} style={{ display:"flex", justifyContent:"space-between", fontSize:10.5, color:"rgba(200,195,230,.55)", marginBottom:3 }}>
                <span style={{ color:"rgba(167,139,250,.75)", fontWeight:600 }}>{d.role}</span>
                <span>{d.email} / {d.pw}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
