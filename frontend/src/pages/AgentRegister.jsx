import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Gift, TrendingUp, Users, Crown, BadgeDollarSign, Star, QrCode, Clipboard, ChevronLeft, AlertCircle, Eye, EyeOff, User, Mail, Phone, Lock, MessageCircle } from "lucide-react";
import useAuthStore from "../store/authStore.js";
import api from "../api/axios.js";
import toast from "react-hot-toast";
import { gsap } from "gsap";

const BENEFITS = [
  { icon:Gift,              label:"Welcome Voucher",   value:"Rs.1000",       desc:"Credited on joining",                                   color:"#fbbf24", bg:"rgba(251,191,36,.12)",  border:"rgba(251,191,36,.3)"  },
  { icon:TrendingUp,        label:"Monthly Reward",    value:"Rs.100 × 40 mo", desc:"Total Rs.4,000 — offer only till pre-launching period", color:"#34d399", bg:"rgba(52,211,153,.1)",   border:"rgba(52,211,153,.28)" },
  { icon:Users,             label:"Referral Income",   value:"Multi-level",   desc:"Earn on every referral purchase",                       color:"#a78bfa", bg:"rgba(167,139,250,.1)",  border:"rgba(167,139,250,.28)"},
  { icon:Star,              label:"Global Pool Entry", value:"Exclusive",     desc:"Participate in pool matrix rewards",                    color:"#f472b6", bg:"rgba(244,114,182,.1)",  border:"rgba(244,114,182,.28)"},
  { icon:CheckCircle,       label:"Sales Training",    value:"Free",          desc:"2 weeks worth Rs.25,000 — included",                    color:"#22d3ee", bg:"rgba(34,211,238,.1)",   border:"rgba(34,211,238,.28)" },
  { icon:BadgeDollarSign,   label:"Agent Dashboard",   value:"Full Access",   desc:"Real-time earnings & referral tracker",                 color:"#fb923c", bg:"rgba(251,146,60,.1)",   border:"rgba(251,146,60,.28)" },
];

export default function AgentRegister() {
  const { user, refreshUser, register } = useAuthStore();
  const [step, setStep]             = useState(1);
  const [regLoading, setRegLoading] = useState(false);
  const [qrLoading, setQrLoading]   = useState(false);
  const [qrData, setQrData]         = useState(null);
  const [qrLabel, setQrLabel]       = useState("UPI / Bank Transfer");
  const [whatsapp, setWhatsapp]     = useState("");
  const [whatsappNote, setWhatsappNote] = useState("Send the payment screenshot to the WhatsApp number below along with your ID and registered phone number.");
  const [txnId, setTxnId]           = useState("");
  const [searchParams]              = useSearchParams();
  const initialRef                  = (searchParams.get("ref") || "").toUpperCase();
  const [regForm, setRegForm]       = useState({ name:"", email:"", phone:"", password:"", referralCode: initialRef });
  const [showRegPw, setShowRegPw]   = useState(false);
  const [wentThroughForm, setWentThroughForm] = useState(false);
  const navigate = useNavigate();
  const cardRef  = useRef();
  const heroRef  = useRef();
  const step2Ref = useRef();

  useEffect(() => {
    if (user?.isAgent) { navigate("/agent"); return; }
    if (user?.agentApprovalStatus === 'pending') {
      // Already submitted — show pending screen and load WhatsApp config
      (async () => {
        try {
          const { data } = await api.get("/admin/payment-qr");
          setWhatsapp(data.whatsapp || "");
          if (data.whatsappNote) setWhatsappNote(data.whatsappNote);
          setQrLabel(data.label || "UPI / Bank Transfer");
        } catch {}
        setTxnId(user?.agentPaymentTxnId || "");
        setStep(4);
      })();
    }
    gsap.fromTo(heroRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "expo.out" }
    );
    gsap.fromTo(cardRef.current,
      { y: 60, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: "expo.out", delay: 0.1 }
    );
    gsap.fromTo(".benefit-card",
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.08, duration: 0.45, ease: "power3.out", delay: 0.3 }
    );
    // mark card as visible so returning to step1 works
    if (cardRef.current) cardRef.current.style.opacity = "";
  }, []);

  const animateStep1 = () => {
    setTimeout(() => {
      if (cardRef.current) {
        gsap.fromTo(cardRef.current,
          { y: 30, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }
        );
      }
      gsap.fromTo(".benefit-card",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.06, duration: 0.4, ease: "power3.out" }
      );
    }, 50);
  };

  const animateStep2 = () => {
    setTimeout(() => {
      if (step2Ref.current) {
        gsap.fromTo(step2Ref.current,
          { y: 40, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }
        );
      }
    }, 50);
  };

  const fetchQRAndGoToStep3 = async () => {
    setQrLoading(true);
    try {
      const { data } = await api.get("/admin/payment-qr");
      setQrData(data.qr);
      setQrLabel(data.label || "UPI / Bank Transfer");
      setWhatsapp(data.whatsapp || "");
      if (data.whatsappNote) setWhatsappNote(data.whatsappNote);
    } catch {
      // proceed even if QR not configured yet
    } finally {
      setQrLoading(false);
    }
    setStep(3);
    animateStep2();
  };

  const goToPayment = () => {
    // Always show form first; prefill from user if logged in
    if (user) {
      setRegForm(prev => ({
        ...prev,
        name:  prev.name  || user.name  || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        referralCode: prev.referralCode || user.referredBy || initialRef || "",
      }));
    }
    setStep(2);
    animateStep2();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      if (!user) {
        if (regForm.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setRegLoading(false);
          return;
        }
        await register(regForm);
        toast.success("Account created! Now complete your payment.");
      } else {
        toast.success("Details confirmed. Proceed to payment.");
      }
      setWentThroughForm(true);
      await fetchQRAndGoToStep3();
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!txnId.trim() || txnId.trim().length < 4) {
      toast.error("Please enter a valid transaction ID");
      return;
    }
    setRegLoading(true);
    try {
      await api.post("/agent/register", { txnId: txnId.trim() });
      await refreshUser();
      toast.success("Application submitted! Awaiting admin approval.");
      setStep(4);
      animateStep2();
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setRegLoading(false);
    }
  };

  // Build WhatsApp deep-link with pre-filled message containing txn id + agent id
  const buildWhatsappLink = () => {
    if (!whatsapp) return null;
    const num = whatsapp.replace(/[^0-9]/g, "");
    const lines = [
      "Hi GMT Mart Admin,",
      "I have just submitted my Sales Agent registration. Please find my payment details below:",
      "",
      `Name: ${user?.name || ""}`,
      `Registered Phone: ${user?.phone || ""}`,
      `Email: ${user?.email || ""}`,
      `Agent ID / Referral Code: ${user?.referralCode || ""}`,
      `Transaction ID: ${txnId || "(will paste after entering)"}`,
      "",
      "Sharing the payment screenshot in this chat. Kindly approve my account.",
    ];
    return `https://wa.me/${num}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <>
      <style>{`
        .agent-bg { min-height:100vh; background:radial-gradient(ellipse at 50% 15%,#190a38 0%,#050010 38%,#000510 65%,#000305 100%); padding:32px 16px 48px; position:relative; overflow:hidden; }
        .agent-grid { position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(124,58,237,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,.07) 1px,transparent 1px); background-size:44px 44px; }
        @keyframes agentAurora { 0%,100%{transform:translate(0,0) scale(1);opacity:.5;}50%{transform:translate(4%,-6%) scale(1.1);opacity:.68;} }
        .agent-blob { animation:agentAurora var(--d,18s) ease-in-out infinite; position:absolute; border-radius:50%; pointer-events:none; }
        @keyframes scanLine { 0%{top:-2%;}100%{top:102%;} }
        .agent-scan { animation:scanLine 10s linear infinite; position:absolute; left:0; right:0; height:1.5px; pointer-events:none; z-index:1; background:linear-gradient(90deg,transparent,rgba(251,191,36,.3),rgba(251,191,36,.55),rgba(251,191,36,.3),transparent); }
        .agent-glass { background:linear-gradient(150deg,rgba(255,255,255,.044) 0%,rgba(124,58,237,.055) 50%,rgba(6,182,212,.025) 100%); border:1px solid rgba(167,139,250,.2); backdrop-filter:blur(32px); -webkit-backdrop-filter:blur(32px); border-radius:24px; box-shadow:0 32px 96px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(124,58,237,.12); }
        .benefit-card { border-radius:18px; padding:16px 18px; display:flex; align-items:flex-start; gap:14px; opacity:0; }
        .btn-agent-main { width:100%; padding:17px; border-radius:16px; background:linear-gradient(135deg,#fde68a 0%,#fbbf24 45%,#f97316 100%); color:#1a0a00; font-weight:900; font-size:16px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; box-shadow:0 0 0 2.5px rgba(251,191,36,.4),0 10px 40px rgba(251,191,36,.5),inset 0 1px 0 rgba(255,255,255,.3); transition:filter .2s,transform .15s; }
        .btn-agent-main:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-2px); }
        .btn-agent-main:disabled { opacity:.65; cursor:not-allowed; }
        .txn-input { width:100%; padding:14px 16px; border-radius:14px; background:rgba(255,255,255,.05); border:1.5px solid rgba(167,139,250,.3); color:#fff; font-size:15px; font-weight:600; outline:none; transition:border-color .2s; box-sizing:border-box; }
        .txn-input::placeholder { color:rgba(167,139,250,.35); font-weight:400; }
        .txn-input:focus { border-color:rgba(251,191,36,.6); box-shadow:0 0 0 3px rgba(251,191,36,.08); }
        .auth-link3 { color:#a78bfa; text-decoration:none; font-weight:700; transition:color .2s; }
        .auth-link3:hover { color:#fbbf24; }
        @keyframes pulseQR { 0%,100%{box-shadow:0 0 0 4px rgba(251,191,36,.35),0 0 40px rgba(251,191,36,.25);} 50%{box-shadow:0 0 0 7px rgba(251,191,36,.55),0 0 64px rgba(251,191,36,.4);} }
        .qr-frame { background:#fff; border-radius:18px; padding:16px; display:inline-flex; align-items:center; justify-content:center; animation:pulseQR 2.5s ease-in-out infinite; }
        @media (max-width:767px) {
          .ar-step1-grid { grid-template-columns:1fr !important; }
          .agent-bg { padding-left:12px !important; padding-right:12px !important; }
          .agent-glass { backdrop-filter:none !important; -webkit-backdrop-filter:none !important; }
        }
      `}</style>
      <div className="agent-bg">
        <div className="agent-grid" />
        <div className="agent-scan" />
        {[
          { c:"rgba(124,58,237,.32)", w:550, t:"-12%", l:"-10%", d:"18s" },
          { c:"rgba(251,191,36,.18)", w:420, t:"-8%",  r:"-12%", d:"14s" },
          { c:"rgba(16,185,129,.18)", w:400, b:"-8%",  l:"5%",   d:"22s" },
          { c:"rgba(236,72,153,.2)",  w:380, b:"-5%",  r:"3%",   d:"17s" },
        ].map((b,i) => (
          <div key={i} className="agent-blob" style={{ "--d":b.d, width:b.w, height:b.w, background:`radial-gradient(circle,${b.c},transparent 70%)`, top:b.t, left:b.l, right:b.r, bottom:b.b, filter:"blur(75px)" }} />
        ))}

        <div style={{ maxWidth: step===2 ? 560 : 900, margin:"0 auto", position:"relative", zIndex:10 }}>

          {/* Hero header */}
          <div ref={heroRef} style={{ textAlign:"center", marginBottom:36, opacity:0 }}>
            <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:66, height:66, borderRadius:20, background:"linear-gradient(135deg,#fde68a,#fbbf24,#f97316)", boxShadow:"0 0 36px rgba(251,191,36,.65)", marginBottom:18 }}>
              <Crown style={{ width:32, height:32, color:"#1a0a00" }} />
            </div>
            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:10, marginBottom:6 }}>
              <span style={{ fontWeight:900, fontSize:"clamp(1.3rem,3.5vw,1.75rem)", background:"linear-gradient(135deg,#fffde7,#fbbf24,#f97316)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", filter:"drop-shadow(0 0 18px rgba(251,191,36,.7))" }}>GMT</span>
              <span style={{ fontWeight:900, fontSize:"clamp(1.3rem,3.5vw,1.75rem)", background:"linear-gradient(135deg,#f0e6ff,#a78bfa,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>MART</span>
            </div>
            <h1 style={{ fontSize:28, fontWeight:900, color:"#fff", margin:"0 0 8px" }}>Become a Sales Agent</h1>
            <p style={{ color:"rgba(196,181,253,.72)", fontSize:15, maxWidth:480, margin:"0 auto" }}>Join our network and earn passive income from the comfort of your home</p>
          </div>

          {/* ── STEP 1: Benefits & Pricing ── */}
          {step === 1 && (
            <div ref={cardRef} className="ar-step1-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, opacity:0 }}>

              {/* Benefits grid */}
              <div>
                <p style={{ color:"rgba(167,139,250,.75)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:16 }}>What You Get</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {BENEFITS.map((b, i) => (
                    <div key={i} className="benefit-card agent-glass" style={{ background:b.bg, borderColor:b.border, border:`1px solid ${b.border}` }}>
                      <div style={{ width:38, height:38, borderRadius:12, background:b.bg, border:`1px solid ${b.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                        <b.icon style={{ width:19, height:19, color:b.color }} />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:2 }}>
                          <span style={{ color:"rgba(220,210,255,.88)", fontWeight:700, fontSize:13 }}>{b.label}</span>
                          <span style={{ color:b.color, fontWeight:900, fontSize:13, textShadow:`0 0 12px ${b.color}88` }}>{b.value}</span>
                        </div>
                        <p style={{ color:"rgba(180,170,220,.55)", fontSize:11, margin:0 }}>{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registration panel */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <p style={{ color:"rgba(167,139,250,.75)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:4 }}>Registration Details</p>

                <div className="agent-glass" style={{ borderRadius:20, padding:"24px 24px 20px", textAlign:"center" }}>
                  <div style={{ fontSize:14, color:"rgba(167,139,250,.6)", letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:600, marginBottom:4 }}>One Time Registration Fees</div>
                  <div style={{ fontSize:42, fontWeight:900, color:"#fff", lineHeight:1.05, marginBottom:4, textShadow:"0 0 28px rgba(255,255,255,.2)" }}>Rs.999<span style={{ fontSize:18, color:"#fbbf24", marginLeft:6 }}>+ 18% GST</span></div>
                  <div style={{ fontSize:12, color:"rgba(196,181,253,.55)", marginBottom:8 }}>Includes 2-week training worth Rs.25,000</div>
                  <div style={{ fontSize:11, color:"#34d399", fontWeight:700, marginBottom:18, padding:"4px 10px", background:"rgba(52,211,153,.08)", border:"1px solid rgba(52,211,153,.22)", borderRadius:99, display:"inline-block" }}>Offer only till pre-launching period</div>
                  {[
                    { label:"Registration Fees",                                  val:"Rs.999 + 18% GST", c:"rgba(200,195,230,.7)" },
                    { label:"Welcome Voucher",                                    val:"Rs.1,000",         c:"#fbbf24" },
                    { label:"Total Monthly Cash Reward Rs.100/mo × 40 Months",    val:"Rs.4,000",         c:"#34d399" },
                  ].map(r => (
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,.06)", fontSize:13, gap:10 }}>
                      <span style={{ color:"rgba(196,181,253,.6)", textAlign:"left" }}>{r.label}</span>
                      <span style={{ color:r.c, fontWeight:700, whiteSpace:"nowrap" }}>{r.val}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0 0", fontSize:14 }}>
                    <span style={{ color:"rgba(196,181,253,.8)", fontWeight:700 }}>Net Earning</span>
                    <span style={{ color:"#34d399", fontWeight:900, fontSize:16, textShadow:"0 0 16px rgba(52,211,153,.6)" }}>Rs.4,000</span>
                  </div>
                </div>

                <button onClick={goToPayment} disabled={qrLoading} className="btn-agent-main">
                  {qrLoading ? "Loading\u2026" : "Register as Agent"}
                  <ArrowRight style={{ width:20, height:20 }} />
                </button>

                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {["Passive Income","Work From Home","No Target Pressure","Referral Income","Lifetime Benefits"].map(t => (
                    <span key={t} style={{ fontSize:11, fontWeight:600, padding:"5px 11px", borderRadius:99, background:"rgba(124,58,237,.14)", border:"1px solid rgba(124,58,237,.3)", color:"rgba(196,181,253,.8)" }}>{t}</span>
                  ))}
                </div>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginTop:6 }}>
                  <Link to="/login" className="auth-link3" style={{ fontSize:12 }}>Sign In</Link>
                  <span style={{ color:"rgba(167,139,250,.3)", fontSize:12 }}>•</span>
                  <Link to="/register" className="auth-link3" style={{ fontSize:12 }}>Register Free</Link>
                  <span style={{ color:"rgba(167,139,250,.3)", fontSize:12 }}>•</span>
                  <Link to="/" className="auth-link3" style={{ fontSize:12 }}>Back to Home</Link>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Registration Form ── */}
          {step === 2 && (
            <div ref={step2Ref} style={{ opacity:0 }}>
              <div className="agent-glass" style={{ borderRadius:28, padding:"36px 32px 32px", maxWidth:520, margin:"0 auto" }}>

                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
                  <button onClick={() => { setStep(1); animateStep1(); }} style={{ background:"rgba(167,139,250,.12)", border:"1px solid rgba(167,139,250,.25)", borderRadius:10, padding:"6px 12px", color:"#a78bfa", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:600 }}>
                    <ChevronLeft style={{ width:15, height:15 }} /> Back
                  </button>
                  <div style={{ flex:1 }} />
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:99, fontSize:11, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.35)", color:"#c4b5fd" }}>
                    Step 2 of 3 — {user ? "Confirm Details" : "Create Account"}
                  </span>
                </div>

                <div style={{ textAlign:"center", marginBottom:28 }}>
                  <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:54, height:54, borderRadius:16, background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.35)", marginBottom:14 }}>
                    <User style={{ width:26, height:26, color:"#a78bfa" }} />
                  </div>
                  <h2 style={{ fontSize:22, fontWeight:900, color:"#fff", margin:"0 0 6px" }}>{user ? "Confirm Your Details" : "Create Your Account"}</h2>
                  <p style={{ color:"rgba(196,181,253,.65)", fontSize:13, margin:0 }}>{user ? "Review your information before continuing to payment" : "Fill in your details to create your agent account"}</p>
                </div>

                <form onSubmit={handleFormSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  {[
                    { key:"name",         label:"Full Name",               icon:User,  type:"text",    placeholder:"Your full name" },
                    { key:"email",        label:"Email Address",           icon:Mail,  type:"email",   placeholder:"your@email.com" },
                    { key:"phone",        label:"Phone Number",            icon:Phone, type:"tel",     placeholder:"10-digit mobile" },
                    { key:"referralCode", label:"Referral Code (optional)",icon:Gift,  type:"text",    placeholder:"Enter if you have one" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(196,181,253,.8)", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.08em" }}>{f.label}</label>
                      <div style={{ position:"relative" }}>
                        <f.icon style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", width:15, height:15, color:"rgba(167,139,250,.5)", pointerEvents:"none" }} />
                        <input
                          type={f.type}
                          className="txn-input"
                          style={{ paddingLeft:40 }}
                          placeholder={f.placeholder}
                          value={regForm[f.key]}
                          onChange={e => setRegForm(prev => ({ ...prev, [f.key]: f.key==="referralCode" ? e.target.value.toUpperCase() : e.target.value }))}
                          required={f.key !== "referralCode"}
                        />
                      </div>
                    </div>
                  ))}
                  {!user && (
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(196,181,253,.8)", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.08em" }}>Password</label>
                      <div style={{ position:"relative" }}>
                        <Lock style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", width:15, height:15, color:"rgba(167,139,250,.5)", pointerEvents:"none" }} />
                        <input
                          type={showRegPw ? "text" : "password"}
                          className="txn-input"
                          style={{ paddingLeft:40, paddingRight:42 }}
                          placeholder="Min 6 characters"
                          value={regForm.password}
                          onChange={e => setRegForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                        <button type="button" onClick={() => setShowRegPw(p => !p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(167,139,250,.5)", padding:0, display:"flex" }}>
                          {showRegPw ? <EyeOff style={{ width:15, height:15 }} /> : <Eye style={{ width:15, height:15 }} />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={regLoading} className="btn-agent-main" style={{ marginTop:6 }}>
                    {regLoading ? (user ? "Loading…" : "Creating Account…") : "Continue to Payment"}
                    {!regLoading && <ArrowRight style={{ width:19, height:19 }} />}
                  </button>
                </form>

                {!user && (
                  <p style={{ textAlign:"center", marginTop:14, fontSize:12, color:"rgba(167,139,250,.5)" }}>
                    Already have an account?{" "}
                    <button onClick={() => { navigate("/login?redirect=/agent/register"); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#a78bfa", fontWeight:700, fontSize:12, padding:0 }}>Sign In</button>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: QR Payment ── */}
          {step === 3 && (
            <div ref={step2Ref} style={{ opacity:0 }}>
              <div className="agent-glass" style={{ borderRadius:28, padding:"36px 32px 32px", maxWidth:520, margin:"0 auto" }}>

                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
                  <button onClick={() => { const s = wentThroughForm ? 2 : 1; setStep(s); if (s === 2) animateStep2(); else animateStep1(); }} style={{ background:"rgba(167,139,250,.12)", border:"1px solid rgba(167,139,250,.25)", borderRadius:10, padding:"6px 12px", color:"#a78bfa", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:600 }}>
                    <ChevronLeft style={{ width:15, height:15 }} /> Back
                  </button>
                  <div style={{ flex:1 }} />
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:99, fontSize:11, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", background:"rgba(251,191,36,.12)", border:"1px solid rgba(251,191,36,.3)", color:"#fbbf24" }}>
                    Final Step — Payment
                  </span>
                </div>

                <div style={{ textAlign:"center", marginBottom:28 }}>
                  <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:54, height:54, borderRadius:16, background:"rgba(251,191,36,.12)", border:"1px solid rgba(251,191,36,.3)", marginBottom:14 }}>
                    <QrCode style={{ width:26, height:26, color:"#fbbf24" }} />
                  </div>
                  <h2 style={{ fontSize:22, fontWeight:900, color:"#fff", margin:"0 0 6px" }}>Scan & Pay Rs.999 + 18% GST</h2>
                  <p style={{ color:"rgba(196,181,253,.65)", fontSize:13, margin:0 }}>
                    Scan the QR code below using <strong style={{ color:"#fbbf24" }}>{qrLabel}</strong>
                  </p>
                </div>

                <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
                  {qrData ? (
                    <div className="qr-frame">
                      <img src={qrData} alt="Payment QR Code" style={{ width:200, height:200, objectFit:"contain", display:"block" }} />
                    </div>
                  ) : (
                    <div style={{ width:232, height:232, borderRadius:18, background:"rgba(167,139,250,.06)", border:"2px dashed rgba(167,139,250,.3)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
                      <AlertCircle style={{ width:32, height:32, color:"rgba(167,139,250,.4)" }} />
                      <p style={{ color:"rgba(167,139,250,.45)", fontSize:13, textAlign:"center", margin:0, padding:"0 16px" }}>QR code not configured yet.<br/>Contact admin for payment details.</p>
                    </div>
                  )}
                </div>

                {/* WhatsApp note + number */}
                <div style={{ background:"rgba(37,211,102,.08)", border:"1px solid rgba(37,211,102,.3)", borderRadius:14, padding:"14px 16px", marginBottom:22, textAlign:"center" }}>
                  <p style={{ color:"rgba(220,255,235,.85)", fontSize:12.5, margin:"0 0 10px", lineHeight:1.55 }}>
                    {whatsappNote}
                  </p>
                  {whatsapp ? (
                    <a
                      href={buildWhatsappLink()}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:99, background:"linear-gradient(135deg,#25d366,#128c7e)", color:"#fff", fontWeight:800, fontSize:14, textDecoration:"none", boxShadow:"0 6px 20px rgba(37,211,102,.45)" }}
                    >
                      <MessageCircle style={{ width:16, height:16 }} />
                      Chat on WhatsApp: {whatsapp}
                    </a>
                  ) : (
                    <p style={{ color:"rgba(167,139,250,.5)", fontSize:12, margin:0, fontStyle:"italic" }}>
                      WhatsApp number not configured yet — contact admin.
                    </p>
                  )}
                </div>

                <div style={{ background:"rgba(251,191,36,.06)", border:"1px solid rgba(251,191,36,.18)", borderRadius:14, padding:"12px 16px", marginBottom:22 }}>
                  <p style={{ color:"rgba(251,191,36,.8)", fontSize:12, fontWeight:700, margin:"0 0 6px" }}>How to pay:</p>
                  <ol style={{ color:"rgba(196,181,253,.7)", fontSize:12, margin:0, paddingLeft:18, lineHeight:1.8 }}>
                    <li>Scan the QR code above with your payment app</li>
                    <li>Enter amount <strong style={{ color:"#fbbf24" }}>Rs.999 + 18% GST</strong> and confirm</li>
                    <li>Send the payment screenshot to the WhatsApp number above</li>
                    <li>Copy the <strong style={{ color:"#fbbf24" }}>Transaction ID</strong> from your receipt</li>
                    <li>Paste it below and click Complete Registration</li>
                  </ol>
                </div>

                <div style={{ marginBottom:20 }}>
                  <label style={{ display:"block", color:"rgba(167,139,250,.8)", fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>
                    Transaction ID / Reference No.
                  </label>
                  <div style={{ position:"relative" }}>
                    <input
                      className="txn-input"
                      type="text"
                      placeholder="e.g. UPI / Bank reference no."
                      value={txnId}
                      onChange={e => setTxnId(e.target.value)}
                    />
                    <Clipboard style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", width:17, height:17, color:"rgba(167,139,250,.4)", pointerEvents:"none" }} />
                  </div>
                  <p style={{ color:"rgba(167,139,250,.4)", fontSize:11, marginTop:6 }}>Enter the transaction reference from your payment receipt</p>
                </div>

                <button onClick={handleRegister} disabled={regLoading || !txnId.trim()} className="btn-agent-main" style={{ marginBottom:14 }}>
                  {regLoading ? "Processing…" : "Complete Registration"}
                  {!regLoading && <CheckCircle style={{ width:19, height:19 }} />}
                </button>

                <p style={{ textAlign:"center", fontSize:12, color:"rgba(167,139,250,.4)", margin:0 }}>
                  Registration activates after payment verification by admin
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 4: Pending Approval ── */}
          {step === 4 && (
            <div ref={step2Ref} style={{ opacity:0 }}>
              <div className="agent-glass" style={{ borderRadius:28, padding:"40px 32px 32px", maxWidth:560, margin:"0 auto", textAlign:"center" }}>
                <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:74, height:74, borderRadius:22, background:"linear-gradient(135deg,rgba(251,191,36,.25),rgba(249,115,22,.18))", border:"2px solid rgba(251,191,36,.4)", marginBottom:20, boxShadow:"0 0 40px rgba(251,191,36,.35)" }}>
                  <AlertCircle style={{ width:38, height:38, color:"#fbbf24" }} />
                </div>
                <h2 style={{ fontSize:24, fontWeight:900, color:"#fff", margin:"0 0 10px" }}>Application Submitted!</h2>
                <p style={{ color:"rgba(196,181,253,.75)", fontSize:14, margin:"0 0 18px", lineHeight:1.6 }}>
                  Your sales-agent application is now <strong style={{ color:"#fbbf24" }}>pending admin approval</strong>. You will be able to log in and access your agent dashboard once an admin verifies your payment and approves your account.
                </p>

                {user?.referralCode && (
                  <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:99, background:"rgba(251,191,36,.1)", border:"1px solid rgba(251,191,36,.3)", marginBottom:22 }}>
                    <span style={{ color:"rgba(251,191,36,.7)", fontSize:11, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase" }}>Your Agent ID:</span>
                    <span style={{ color:"#fbbf24", fontWeight:900, fontSize:14, fontFamily:"monospace" }}>{user.referralCode}</span>
                  </div>
                )}

                <div style={{ background:"rgba(37,211,102,.08)", border:"1px solid rgba(37,211,102,.3)", borderRadius:16, padding:"18px 18px 20px", marginBottom:18 }}>
                  <p style={{ color:"rgba(220,255,235,.9)", fontSize:13, margin:"0 0 12px", lineHeight:1.55 }}>
                    {whatsappNote}
                  </p>
                  <div style={{ background:"rgba(0,0,0,.25)", borderRadius:10, padding:"10px 12px", marginBottom:14, fontSize:12, color:"rgba(196,181,253,.8)", textAlign:"left", lineHeight:1.65 }}>
                    <div><span style={{ color:"rgba(167,139,250,.7)" }}>Agent ID:</span> <strong style={{ color:"#fbbf24" }}>{user?.referralCode || "—"}</strong></div>
                    <div><span style={{ color:"rgba(167,139,250,.7)" }}>Phone:</span> <strong style={{ color:"#fff" }}>{user?.phone || "—"}</strong></div>
                    <div><span style={{ color:"rgba(167,139,250,.7)" }}>Txn ID:</span> <strong style={{ color:"#fff" }}>{txnId || user?.agentPaymentTxnId || "—"}</strong></div>
                  </div>
                  {whatsapp ? (
                    <a
                      href={buildWhatsappLink()}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 22px", borderRadius:99, background:"linear-gradient(135deg,#25d366,#128c7e)", color:"#fff", fontWeight:800, fontSize:14.5, textDecoration:"none", boxShadow:"0 8px 24px rgba(37,211,102,.5)" }}
                    >
                      <MessageCircle style={{ width:18, height:18 }} />
                      Send Screenshot on WhatsApp: {whatsapp}
                    </a>
                  ) : (
                    <p style={{ color:"rgba(167,139,250,.5)", fontSize:12, margin:0, fontStyle:"italic" }}>
                      WhatsApp number not configured yet — contact admin.
                    </p>
                  )}
                </div>

                <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                  <Link to="/" className="auth-link3" style={{ fontSize:13, padding:"10px 20px", borderRadius:12, background:"rgba(167,139,250,.12)", border:"1px solid rgba(167,139,250,.3)", color:"#c4b5fd" }}>
                    Back to Home
                  </Link>
                  <button onClick={async () => { await refreshUser(); if (user?.isAgent) navigate('/agent'); else toast('Still pending — please wait for admin approval', { icon: '⏳' }); }} style={{ fontSize:13, padding:"10px 20px", borderRadius:12, background:"rgba(251,191,36,.12)", border:"1px solid rgba(251,191,36,.35)", color:"#fbbf24", fontWeight:700, cursor:"pointer" }}>
                    Check Approval Status
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

