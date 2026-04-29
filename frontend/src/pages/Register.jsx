import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Crown, LogIn, ArrowRight, ShoppingBag } from "lucide-react";
import { gsap } from "gsap";

export default function Register() {
  const cardRef = useRef();

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 60, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: "expo.out" }
    );
    gsap.fromTo(".reg-opt-card",
      { y: 30, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.12, ease: "expo.out", delay: 0.25 }
    );
  }, []);

  return (
    <>
      <style>{`
        .auth-bg { min-height:100vh; background:radial-gradient(ellipse at 70% 20%,#0d1a40 0%,#050010 40%,#000510 70%,#000305 100%); display:flex; align-items:center; justify-content:center; padding:24px 16px; position:relative; overflow:hidden; }
        .auth-grid { position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(99,102,241,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.07) 1px,transparent 1px); background-size:44px 44px; }
        @keyframes authAurora2 { 0%,100%{transform:translate(0,0) scale(1);opacity:.5;}50%{transform:translate(-4%,6%) scale(1.08);opacity:.68;} }
        .auth-blob2 { animation:authAurora2 var(--d,18s) ease-in-out infinite; position:absolute; border-radius:50%; pointer-events:none; }
        .reg-main-card { background:linear-gradient(150deg,rgba(255,255,255,.044) 0%,rgba(99,102,241,.055) 50%,rgba(16,185,129,.025) 100%); border:1px solid rgba(167,139,250,.2); backdrop-filter:blur(32px); -webkit-backdrop-filter:blur(32px); border-radius:28px; box-shadow:0 32px 96px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(99,102,241,.12); padding:44px 40px 40px; width:100%; max-width:460px; position:relative; z-index:10; }
        .reg-opt-card { border-radius:20px; padding:26px 24px; display:flex; align-items:center; gap:20px; text-decoration:none; transition:transform .2s, box-shadow .2s, border-color .2s; cursor:pointer; opacity:0; }
        .reg-opt-card:hover { transform:translateY(-3px) scale(1.015); }
        .reg-opt-agent { background:linear-gradient(135deg,rgba(251,191,36,.1),rgba(249,115,22,.08)); border:1.5px solid rgba(251,191,36,.35); box-shadow:0 8px 32px rgba(251,191,36,.12); }
        .reg-opt-agent:hover { border-color:rgba(251,191,36,.6); box-shadow:0 12px 44px rgba(251,191,36,.22); }
        .reg-opt-login { background:linear-gradient(135deg,rgba(124,58,237,.1),rgba(99,102,241,.08)); border:1.5px solid rgba(167,139,250,.3); box-shadow:0 8px 32px rgba(99,102,241,.1); }
        .reg-opt-login:hover { border-color:rgba(167,139,250,.6); box-shadow:0 12px 44px rgba(99,102,241,.2); }
        @keyframes pulseGold { 0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.5);} 50%{box-shadow:0 0 0 8px rgba(251,191,36,0);} }
        .icon-pulse-gold { animation:pulseGold 2.8s ease-in-out infinite; }
      `}</style>
      <div className="auth-bg">
        <div className="auth-grid" />
        {[
          { c:"rgba(99,102,241,.28)",  w:500, t:"-8%",  l:"-10%", d:"18s" },
          { c:"rgba(16,185,129,.20)",  w:400, b:"-6%",  l:"5%",   d:"22s" },
          { c:"rgba(251,191,36,.16)",  w:380, t:"-5%",  r:"-8%",  d:"15s" },
          { c:"rgba(236,72,153,.18)",  w:340, b:"-5%",  r:"3%",   d:"20s" },
        ].map((b,i) => (
          <div key={i} className="auth-blob2" style={{ "--d":b.d, width:b.w, height:b.w, background:`radial-gradient(circle,${b.c},transparent 70%)`, top:b.t, left:b.l, right:b.r, bottom:b.b, filter:"blur(72px)" }} />
        ))}

        <div ref={cardRef} className="reg-main-card" style={{ opacity:0 }}>
          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#7c3aed,#4c1d95)", boxShadow:"0 0 28px rgba(124,58,237,.7)", marginBottom:14 }}>
              <ShoppingBag style={{ width:26, height:26, color:"#fff" }} />
            </div>
            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:7, marginBottom:4 }}>
              <span style={{ fontWeight:900, fontSize:22, background:"linear-gradient(135deg,#fffde7,#fbbf24,#f97316)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>GMT</span>
              <span style={{ fontWeight:900, fontSize:22, background:"linear-gradient(135deg,#f0e6ff,#a78bfa,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>MART</span>
            </div>
            <h1 style={{ fontSize:20, fontWeight:900, color:"#fff", margin:"0 0 6px" }}>Welcome!</h1>
            <p style={{ color:"rgba(196,181,253,.65)", fontSize:13, margin:0 }}>Choose how you'd like to get started</p>
          </div>

          {/* Option 1 — Become Agent */}
          <Link to="/agent/register" className="reg-opt-card reg-opt-agent" style={{ marginBottom:14 }}>
            <div className="icon-pulse-gold" style={{ width:52, height:52, borderRadius:16, background:"linear-gradient(135deg,#fde68a,#fbbf24,#f97316)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 6px 24px rgba(251,191,36,.5)" }}>
              <Crown style={{ width:26, height:26, color:"#1a0a00" }} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:900, fontSize:16, color:"#fff", marginBottom:3 }}>Become a Sales Agent</div>
              <div style={{ fontSize:12.5, color:"rgba(251,191,36,.75)", fontWeight:600, marginBottom:6 }}>Rs.999 one-time • Earn Rs.3,000+ monthly</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {["Welcome Voucher","Monthly Cashback","Referral Income"].map(t => (
                  <span key={t} style={{ fontSize:10.5, padding:"3px 9px", borderRadius:99, background:"rgba(251,191,36,.12)", border:"1px solid rgba(251,191,36,.25)", color:"rgba(251,191,36,.8)", fontWeight:600 }}>{t}</span>
                ))}
              </div>
            </div>
            <ArrowRight style={{ width:20, height:20, color:"rgba(251,191,36,.6)", flexShrink:0 }} />
          </Link>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ flex:1, height:1, background:"rgba(167,139,250,.15)" }} />
            <span style={{ color:"rgba(167,139,250,.38)", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>or</span>
            <div style={{ flex:1, height:1, background:"rgba(167,139,250,.15)" }} />
          </div>

          {/* Option 2 — Sign In */}
          <Link to="/login" className="reg-opt-card reg-opt-login">
            <div style={{ width:52, height:52, borderRadius:16, background:"linear-gradient(135deg,rgba(124,58,237,.3),rgba(99,102,241,.25))", border:"1.5px solid rgba(167,139,250,.35)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 6px 24px rgba(124,58,237,.3)" }}>
              <LogIn style={{ width:24, height:24, color:"#c4b5fd" }} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:900, fontSize:16, color:"#fff", marginBottom:3 }}>Sign In to Account</div>
              <div style={{ fontSize:12.5, color:"rgba(196,181,253,.65)", fontWeight:500 }}>Already a member? Access your dashboard</div>
            </div>
            <ArrowRight style={{ width:20, height:20, color:"rgba(167,139,250,.5)", flexShrink:0 }} />
          </Link>

          <p style={{ textAlign:"center", marginTop:24, fontSize:12, color:"rgba(167,139,250,.4)" }}>
            <Link to="/" style={{ color:"rgba(167,139,250,.55)", textDecoration:"none", fontWeight:600 }}>← Back to Home</Link>
          </p>
        </div>
      </div>
    </>
  );
}
