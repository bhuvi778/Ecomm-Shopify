import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { ChevronDown, ChevronRight, Search, Users, ArrowRight, Package, Sparkles, ShoppingBag, Zap, Star, Trophy, Timer } from "lucide-react";

gsap.registerPlugin(TextPlugin);

/* ─────────────────────────────────────────────────────────────────
   BRAND
───────────────────────────────────────────────────────────────── */
const BRAND       = "GMT MART";
const TAGLINE     = "India's No.1 Fashion & Lifestyle Destination";
const LAUNCH_DATE = new Date("2026-08-01T00:00:00");

/* ── COUNTDOWN HOOK ── */
function useCountdown(target) {
  const calc = () => {
    const diff = Math.max(0, target - Date.now());
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ─────────────────────────────────────────────────────────────────
   CATEGORIES
───────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id:"woman",      label:"Woman",               emoji:"👗", accent:"#f472b6", from:"#f472b6", to:"#e11d48",
    subcats:[
      { label:"Sarees",           items:["Georgette Sarees","Chiffon Sarees","Cotton Sarees","Net Sarees","Silk Sarees","Bridal Sarees"] },
      { label:"Kurties",          items:["Anarkali Kurtis","Rayon Kurtis","Cotton Kurtis","Straight Kurtis","Long Kurtis"] },
      { label:"Kurta Sets",       items:["Kurta Palazzo Set","Kurta Pant Sets","Sharara Sets","Anarkali Kurta Sets","Cotton Kurta Sets"] },
      { label:"Dupatta Sets",     items:["Cotton Sets","Rayon Sets"] },
      { label:"Suit & Dress Material",items:["Pakistani Dress Material","Cotton","Patiala","Banarasi","Party Wear"] },
      { label:"Lehengas",         items:["Shoppers Favourite","Trending Lehengas"] },
      { label:"Blouses",          items:["Shoppers Favourite","Trending Blouses"] },
      { label:"Gowns",            items:["Shoppers Favourite","Trending Gowns"] },
      { label:"Ethnic Wear",      items:["Ethnic Skirts","Ethnic Jackets","Islamic Fashion","Petticoats","Blouse Pieces","Dupattas"] },
      { label:"Top Wear",         items:["Tops & Tunics","Dresses","T-Shirts","Gowns","Tops & Bottom Sets","Shirts","Jumpsuits"] },
      { label:"Bottom Wear",      items:["Jeans & Jeggings","Palazzos","Trousers & Pants","Leggings","Shorts & Skirts"] },
      { label:"Winter Wear",      items:["Jackets","Sweatshirts","Sweaters","Capes Shrugs & Ponchos","Coats","Blazers & Waistcoats"] },
      { label:"Plus Size",        items:["Dresses","Tops","Bottom Wear"] },
      { label:"Inner Wear",       items:["Bra & Bralettes","Panties","Lingerie Sets","Shapewear","Camisoles & Inners"] },
      { label:"Sleep Wear",       items:["Night Suits","Night Dress","Sleepwear"] },
      { label:"Sports Wear",      items:["Sports Bottom Wear","Sports Bra","Top & Bottom Sets"] },
      { label:"Maternity Wear",   items:["Kurti & Top Wear","Feeding Bras","Briefs & Bottom Wear"] },
    ]},
  { id:"man",        label:"Man",                 emoji:"👔", accent:"#60a5fa", from:"#60a5fa", to:"#2563eb",
    subcats:[
      { label:"Top Wear",    items:["Summer T-Shirts","Shirts","T-Shirts Combo"] },
      { label:"Bottom Wear", items:["Jeans","Cargo/Trouser","Dhotis/Lungis"] },
      { label:"Ethnic Wear", items:["Kurtas","Kurta Sets","Nehru Jackets"] },
      { label:"Inner Wear",  items:["Vests","Briefs","Boxers"] },
      { label:"Sports Wear", items:["Trackpants","Tracksuits","Gym T-Shirts"] },
      { label:"Night Wear",  items:["Pyjamas","Night Shorts","Night Suits"] },
      { label:"Winter Wear", items:["Shrugs","Jackets","Sweatshirts"] },
      { label:"Accessories", items:["Watches","Wallets","Jewelry","Sunglasses & Spectacles","Belts"] },
      { label:"Footwear",    items:["Casual Shoes","Sports Shoes","Flip Flops","Formal Shoes","Loafers"] },
    ]},
  { id:"kids",       label:"Kids",                emoji:"🧒", accent:"#fbbf24", from:"#fbbf24", to:"#f97316",
    subcats:[
      { label:"Kids Clothing",    items:["Girls","Boys","Babies","Frocks & Dresses","T-Shirts & Polos"] },
      { label:"Kids Toys",        items:["Toys & Games"] },
      { label:"Kids Accessories", items:["Bags & Backpacks","Kids Accessories","Party Items"] },
      { label:"Baby Care",        items:["Baby Bedding","Newborn Care","Diapers","Baby Mosquito Protection","Baby Dry Sheets"] },
    ]},
  { id:"home",       label:"Home & Living",        emoji:"🏠", accent:"#34d399", from:"#34d399", to:"#059669",
    subcats:[
      { label:"Home Decor",           items:["Covers","Key Holders","Artificial Plants","Pooja Needs","Party Supplies","Wallpapers & Stickers","Show Pieces","Clocks"] },
      { label:"Kitchen & Appliances", items:["Storage & Organizers","Cookware","Kitchen Tools","Kitchen Appliances","Dinnerware","Glasses & Barware","Kitchen Linen","Home Appliances"] },
      { label:"Home Textiles",        items:["Bedsheets","Curtains & Accessories","Doormats & Carpets","Pillow Cushion","Blankets & Comforters"] },
      { label:"Home Improvement",     items:["Bathroom Accessories","Cleaning Supplies","Gardening","Home Tools","Insect Protection"] },
      { label:"Furniture",            items:["Shoe Racks","Study Tables","Collapsible Wardrobes","Wall Shelves","Home Temple","Hammock Swing"] },
    ]},
  { id:"beauty",     label:"Beauty & Care",        emoji:"💄", accent:"#e879f9", from:"#e879f9", to:"#c026d3",
    subcats:[
      { label:"Make Up",       items:["Lipstick","Eye Shadow & Liner","Face Makeup","Makeup Kits","Hair Curlers","Nail Makeup","Brushes & Accessories","Hair Removal","Perfumes"] },
      { label:"Personal Care", items:["Body Lotion","Hair Oil & Shampoo","Whitening Creams","Straighteners","Face Oil & Serum","Face Wash","Face Masks & Peels","Soaps & Scrubs"] },
      { label:"Health Care",   items:["Oral Care","Winter Healthcare","Ear Cleaner","Health Monitor","Foot Care","Sexual Wellness","Ayurveda & Nutrition"] },
      { label:"Sanitary Pads", items:[] },
      { label:"Baby & Mom",    items:["Baby Care Essentials","Mom Care"] },
      { label:"Mens Care",     items:["Trimmers","Beard Oil","Men Perfumes","Hair Gels Wax & Spray","Face & Body Care","Budget Grooming"] },
    ]},
  { id:"jewellery",  label:"Jewellery",            emoji:"💍", accent:"#fcd34d", from:"#fcd34d", to:"#d97706",
    subcats:[
      { label:"Jewellery",         items:["Jewellery Sets","Earrings","Mangalsutras","Necklaces & Chains","Bangles & Bracelets","Anklets & Nosepins","Kamarbandh & Maangtika"] },
      { label:"Men Accessories",   items:["Men Watches","Wallets","Mens Jewellery","Sunglasses","Belts"] },
      { label:"Woman Accessories", items:["Woman Watches","Hair Accessories","Woman Belts","Sunglasses","Scarves & Stoles"] },
    ]},
  { id:"footwear",   label:"Footwear",             emoji:"👟", accent:"#22d3ee", from:"#22d3ee", to:"#0891b2",
    subcats:[
      { label:"Woman Footwear", items:["Heels & Sandals","Flats","Boots","Flip Flops & Slippers","Bellies & Ballerinas"] },
      { label:"Kids Footwear",  items:["Boys Shoes","Girls Shoes","Casual Shoes","Flip Flops & Slippers","Sandals"] },
    ]},
  { id:"bags",       label:"Bags & Luggage",       emoji:"👜", accent:"#a78bfa", from:"#a78bfa", to:"#7c3aed",
    subcats:[
      { label:"Woman Bags",            items:["Backpacks","Hand Bags","Sling Bags","Wallets","Clutches"] },
      { label:"Men Bags",              items:["Backpacks","Waist Bags","Cross Body Bags"] },
      { label:"Travel Bags & Luggage", items:["Duffel Bags","Trolley Bags","Laptop Bags"] },
    ]},
  { id:"electronics",label:"Electronics",          emoji:"📱", accent:"#94a3b8", from:"#94a3b8", to:"#475569",
    subcats:[
      { label:"Audio & Mobiles", items:["Neckband","Speakers","Wired Earphone","Bluetooth Earbuds","Feature Phone","Smartphone"] },
      { label:"Accessories",     items:["Mobile Holders","Mobile Chargers","Power Banks","Microphone","Selfie Stick & Ringlight","Tripod & Monopod","Extension Cord","Screen Expanders"] },
      { label:"Watches",         items:["Analog Watches","Digital Watches","Sport Watches","Couple Watch","Bands & Boxes"] },
    ]},
  { id:"fitness",    label:"Fitness & Sports",     emoji:"💪", accent:"#fb923c", from:"#fb923c", to:"#dc2626",
    subcats:[
      { label:"Fitness",       items:["Exercise Bands","Tummy Trimmers","Skipping Ropes","Hand Grip","Yoga","Fitness Accessories"] },
      { label:"Fitness Gears", items:[] },
      { label:"Sports",        items:["Cricket","Cycles","Skating","Football","Badminton","Volleyball","Fishing","Swimming"] },
    ]},
  { id:"automotive", label:"Automotive",           emoji:"🚗", accent:"#86efac", from:"#86efac", to:"#15803d",
    subcats:[
      { label:"Bike & Scooter Accessories", items:["Bike LED Lights","Bike Covers","Bike Accessories","Safety Gear & Clothing","Helmets","Scooty"] },
      { label:"Car Accessories",            items:["Interior Accessories","Car Care & Cleaning","Car Repair Assistance","Car Mobile Holders","Car Covers","Car Exterior Accessories"] },
    ]},
  { id:"stationery", label:"Office & Stationery",  emoji:"📝", accent:"#6ee7b7", from:"#6ee7b7", to:"#047857",
    subcats:[{ label:"Office Supplies & Stationery", items:["Pens & Pencils","Diaries & Notebooks","Art & Craft Supplies","Files & Desks","Adhesives & Tapes"] }]},
  { id:"food",       label:"Food & Drinks",         emoji:"🍎", accent:"#f87171", from:"#f87171", to:"#b91c1c",
    subcats:[{ label:"Food & Drinks", items:["Dry Fruits","Masala & Spices","Snacks & Namkeens","Pickles","Chocolates & Candies","Biscuits & Cookies","Coffee","Tea"] }]},
  { id:"books",      label:"Books",                 emoji:"📚", accent:"#2dd4bf", from:"#2dd4bf", to:"#0e7490",
    subcats:[
      { label:"Fiction & Non Fiction", items:["Childrens Books","Motivational Books","Novels","Religious Books","Economics & Commerce"] },
      { label:"Academic Books",        items:["UPSC & Central Exams","Competitive Exams","Reference Books","School Textbooks","University Books"] },
    ]},
  { id:"pets",       label:"Pet Supplies",          emoji:"🐾", accent:"#fde68a", from:"#fde68a", to:"#b45309",
    subcats:[{ label:"Pet Supplies", items:["Collars & Leashes","Clothes & Grooming","Food & Treats","Aquarium Accessories","Pet Toys","Pet Bowls"] }]},
  { id:"music",      label:"Musical Instruments",   emoji:"🎵", accent:"#c4b5fd", from:"#c4b5fd", to:"#6d28d9",
    subcats:[
      { label:"Musical Instruments", items:["Dholak & Drum Sets","Piano & Keyboard","String Instruments","Wind Instruments"] },
      { label:"Musical Accessories", items:[] },
    ]},
];

const TICKER_ITEMS = [
  "🎁 Rs.1000 Welcome Voucher FREE",
  "💸 100% Cashback over 50 Months",
  "🚚 Free Cash-on-Delivery",
  "⭐ 10% Direct Referral Bonus",
  "💼 Sales Agents Earn Rs.3000+/Month",
  "👗 500+ Fashion Products",
  "🔒 Secure & Guaranteed",
  "📦 Premium Gujarat Quality",
];

/* ─────────────────────────────────────────────────────────────────
   THREE.JS — PARTICLE SPHERE
───────────────────────────────────────────────────────────────── */
function ParticleSphere() {
  const ref = useRef();
  const count = 2800;
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 1.6 + (Math.random() - 0.5) * 0.55;
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.06;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.035) * 0.18;
    }
  });
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent color="#fbbf24" size={0.012}
        sizeAttenuation depthWrite={false} opacity={0.75}
      />
    </Points>
  );
}

function InnerGlobe() {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.12;
      meshRef.current.rotation.z = clock.elapsedTime * 0.05;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[0.88, 64, 64]}>
        <MeshDistortMaterial
          color="#7c3aed"
          attach="material"
          distort={0.55}
          speed={1.8}
          roughness={0}
          metalness={0.6}
          transparent
          opacity={0.55}
        />
      </Sphere>
    </Float>
  );
}

function GoldRing() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.elapsedTime * 0.18;
      ref.current.rotation.y = clock.elapsedTime * 0.11;
    }
  });
  return (
    <Float speed={0.6} rotationIntensity={0.2} floatIntensity={0.25}>
      <mesh ref={ref}>
        <torusGeometry args={[1.15, 0.016, 16, 100]} />
        <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.06} emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
    </Float>
  );
}

function PurpleRing() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = -clock.elapsedTime * 0.12;
      ref.current.rotation.z =  clock.elapsedTime * 0.08;
    }
  });
  return (
    <Float speed={0.8} rotationIntensity={0.22} floatIntensity={0.35}>
      <mesh ref={ref}>
        <torusGeometry args={[1.38, 0.012, 16, 100]} />
        <meshStandardMaterial color="#a78bfa" metalness={1} roughness={0.06} emissive="#a78bfa" emissiveIntensity={0.38} />
      </mesh>
    </Float>
  );
}

function CyanRing() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y =  clock.elapsedTime * 0.09;
      ref.current.rotation.z = -clock.elapsedTime * 0.15;
    }
  });
  return (
    <Float speed={0.5} rotationIntensity={0.18} floatIntensity={0.2}>
      <mesh ref={ref}>
        <torusGeometry args={[0.92, 0.010, 16, 100]} />
        <meshStandardMaterial color="#22d3ee" metalness={1} roughness={0.05} emissive="#22d3ee" emissiveIntensity={0.45} />
      </mesh>
    </Float>
  );
}

function Scene3D() {
  const { camera } = useThree();
  useEffect(() => { camera.position.z = 3.6; }, [camera]);
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[4, 4, 4]}    intensity={3.5} color="#fbbf24" />
      <pointLight position={[-4, -4, -4]} intensity={2.2} color="#7c3aed" />
      <pointLight position={[0, 5, -3]}   intensity={1.8} color="#06b6d4" />
      <pointLight position={[3, -3, 2]}   intensity={1.4} color="#ec4899" />
      <InnerGlobe />
      <GoldRing />
      <PurpleRing />
      <CyanRing />
      <ParticleSphere />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FLOATING 3D CARD (CSS 3D perspective card)
───────────────────────────────────────────────────────────────── */
function Card3D({ children, className = "", style = {} }) {
  const ref = useRef();
  const handleMove = (e) => {
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left) / width  - 0.5;
    const y = (e.clientY - top)  / height - 0.5;
    gsap.to(ref.current, {
      rotateY: x * 18,
      rotateX: -y * 18,
      transformPerspective: 900,
      duration: 0.35,
      ease: "power2.out",
    });
  };
  const handleLeave = () => {
    gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "elastic.out(1, 0.6)" });
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ willChange:"transform", ...style }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ERROR BOUNDARY — prevents WebGL crash from killing the whole page
───────────────────────────────────────────────────────────────── */
class CanvasErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? null : this.props.children; }
}

/* ─────────────────────────────────────────────────────────────────
   MAIN HOME COMPONENT
───────────────────────────────────────────────────────────────── */
export default function Home() {
  const isMobile = typeof window !== "undefined" &&
    (window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

  const [openCat, setOpenCat] = useState(null);
  const [openSub, setOpenSub] = useState({});
  const [query,   setQuery]   = useState("");
  const [hoverCat,setHoverCat]= useState(null);
  const time = useCountdown(LAUNCH_DATE);

  /* GSAP refs */
  const heroRef    = useRef();
  const badgeRef   = useRef();
  const brandRef   = useRef();
  const tagRef     = useRef();
  const divRef     = useRef();
  const subhRef    = useRef();
  const descRef    = useRef();
  const pillsRef   = useRef();
  const btnRef     = useRef();
  const statsRef   = useRef();
  const asideRef   = useRef();

  /* GSAP master timeline */
  useEffect(() => {
    const tl = gsap.timeline();

    /* Left sidebar slides in */
    gsap.fromTo(asideRef.current,
      { x: -80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.9, ease: "expo.out" }
    );

    /* Stagger all category rows */
    gsap.fromTo(".cat-row-item",
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.045, ease: "power3.out", delay: 0.3 }
    );

    /* Right hero sequence */
    tl.fromTo(badgeRef.current,
        { scale: 0.3, opacity: 0, rotateY: 180 },
        { scale: 1, opacity: 1, rotateY: 0, duration: 0.7, ease: "back.out(1.8)" }
      )
      .fromTo(brandRef.current,
        { y: 60, opacity: 0, skewX: -8 },
        { y: 0, opacity: 1, skewX: 0, duration: 0.85, ease: "expo.out" },
        "-=0.2"
      )
      .fromTo(tagRef.current,
        { opacity: 0, letterSpacing: "0.8em" },
        { opacity: 1, letterSpacing: "0.25em", duration: 0.7, ease: "power3.out" },
        "-=0.35"
      )
      .fromTo(divRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.55, ease: "power3.inOut" },
        "-=0.3"
      )
      .fromTo(subhRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.25"
      )
      .fromTo(descRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
        "-=0.3"
      )
      .fromTo(".pill-item",
        { scale: 0, opacity: 0, rotateZ: -15 },
        { scale: 1, opacity: 1, rotateZ: 0, stagger: 0.08, duration: 0.45, ease: "back.out(2)" },
        "-=0.2"
      )
      .fromTo(btnRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "expo.out" },
        "-=0.1"
      )
      .fromTo(".stat-item",
        { y: 20, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.45, ease: "back.out(1.5)" },
        "-=0.3"
      );
  }, []);

  const toggleCat = (id) => {
    setOpenCat(p => (p === id ? null : id));
    setOpenSub({});
  };
  const toggleSub = (e, catId, label) => {
    e.stopPropagation();
    const k = `${catId}__${label}`;
    setOpenSub(p => ({ ...p, [k]: !p[k] }));
  };
  const filtered = query.trim()
    ? CATEGORIES.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.subcats.some(s =>
          s.label.toLowerCase().includes(query.toLowerCase()) ||
          s.items.some(i => i.toLowerCase().includes(query.toLowerCase()))
        ))
    : CATEGORIES;

  return (
    <>
      <style>{`
        /* ── GENERAL ── */
        * { box-sizing: border-box; }

        /* ── LEFT SIDEBAR ── */
        .sidebar-bg {
          background: linear-gradient(170deg, #06040f 0%, #0d0926 30%, #100b30 60%, #08061a 100%);
          border-right: 1px solid rgba(124,58,237,.22);
          box-shadow: 4px 0 48px rgba(124,58,237,.1);
        }
        .cat-header-bg {
          background: linear-gradient(135deg, #110e38 0%, #1b1460 100%);
          border-bottom: 1px solid rgba(124,58,237,.4);
          box-shadow: 0 4px 28px rgba(124,58,237,.12);
        }
        .cat-row-item {
          border-bottom: 1px solid rgba(255,255,255,.035);
          transition: background .18s, box-shadow .18s;
        }
        .cat-row-item:hover { background: rgba(124,58,237,.07); }
        .cat-row-item.active-cat {
          background: linear-gradient(90deg, rgba(124,58,237,.16), rgba(99,102,241,.08));
          box-shadow: inset 0 0 0 1px rgba(167,139,250,.12);
        }
        .search-box {
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(124,58,237,.3);
          color: #fff;
          transition: border-color .2s, background .2s;
        }
        .search-box:focus { outline:none; border-color: rgba(167,139,250,.7); background: rgba(255,255,255,.09); }
        .search-box::placeholder { color: rgba(167,139,250,.5); }
        .cat-scroll::-webkit-scrollbar       { width: 3px; }
        .cat-scroll::-webkit-scrollbar-track { background: transparent; }
        .cat-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,.5); border-radius: 99px; }

        /* ── RIGHT HERO ── */
        .hero-bg {
          background: radial-gradient(ellipse at 30% 20%, #1a0533 0%, #050010 40%, #000510 70%, #000305 100%);
        }
        /* Animated grid */
        .hero-grid {
          background-image:
            linear-gradient(rgba(124,58,237,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,.08) 1px, transparent 1px);
          background-size: 44px 44px;
        }
        /* Neon text */
        .neon-gmt {
          color: #fbbf24;
          text-shadow:
            0 0 8px #fff8,
            0 0 20px #fbbf24,
            0 0 50px #fbbf24,
            0 0 90px #f97316,
            0 0 140px #b45309;
        }
        .neon-mart {
          color: #ffffff;
          text-shadow:
            0 0 8px #fff8,
            0 0 22px #a78bfa,
            0 0 55px #7c3aed,
            0 0 100px #4c1d95;
        }
        @keyframes neonFlicker {
          0%,19%,21%,23%,25%,54%,56%,100% {
            text-shadow: 0 0 8px #fff8, 0 0 20px #fbbf24, 0 0 50px #fbbf24, 0 0 90px #f97316, 0 0 140px #b45309;
          }
          20%,24%,55% {
            text-shadow: none;
          }
        }
        .neon-gmt { animation: neonFlicker 8s infinite; }

        @keyframes shimmerBadge {
          0%   { background-position: 0% 50%;   }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%;   }
        }
        .shimmer-badge {
          background: linear-gradient(90deg, #b91c1c,#7c3aed,#0f766e,#7c3aed,#b91c1c);
          background-size: 300% auto;
          animation: shimmerBadge 4s ease infinite;
        }
        @keyframes scanLine {
          0%   { top: -3%; }
          100% { top: 103%; }
        }
        .scan-line { animation: scanLine 7s linear infinite; }

        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-inner { display:inline-block; white-space:nowrap; animation: tickerScroll 28s linear infinite; }

        @keyframes twinkle {
          0%,100% { opacity:.08; transform:scale(.6); }
          50%      { opacity:.9;  transform:scale(1.4); }
        }
        .tw-star { animation: twinkle var(--td,2.2s) ease-in-out infinite; }

        @keyframes floatBob {
          0%,100% { transform: translateY(0)    rotate(0deg);  }
          33%      { transform: translateY(-18px) rotate(7deg);  }
          66%      { transform: translateY(-9px)  rotate(-5deg); }
        }
        .float-sticker { animation: floatBob var(--dur,4.5s) ease-in-out infinite; }

        @keyframes ringRotateCW  { to { transform: translate(-50%,-50%) rotate(360deg);  } }
        @keyframes ringRotateCCW { to { transform: translate(-50%,-50%) rotate(-360deg); } }
        .ring-cw  { animation: ringRotateCW  var(--sp,18s) linear infinite; }
        .ring-ccw { animation: ringRotateCCW var(--sp,12s) linear infinite; }

        @keyframes borderGlowPulse {
          0%,100% { box-shadow: 0 0 0 2px rgba(251,191,36,.35), 0 5px 28px rgba(251,191,36,.5); }
          50%      { box-shadow: 0 0 0 4px rgba(251,191,36,.7),  0 5px 40px rgba(251,191,36,.8); }
        }
        .btn-agent   { animation: borderGlowPulse 2.5s ease-in-out infinite; }
        @keyframes glassBtnGlow {
          0%,100% { box-shadow: 0 0 0 1.5px rgba(167,139,250,.3); }
          50%      { box-shadow: 0 0 0 2.5px rgba(167,139,250,.7), 0 4px 20px rgba(167,139,250,.3); }
        }
        .btn-register { animation: glassBtnGlow 2.8s ease-in-out infinite .4s; }

        @keyframes pillGlow {
          0%,100% { opacity:.8; }
          50%      { opacity:1;  }
        }
        .pill-item { animation: pillGlow 3s ease-in-out infinite; }

        /* 3-D canvas vignette */
        .canvas-vignette {
          background: radial-gradient(ellipse, transparent 30%, rgba(5,0,16,.82) 76%);
        }

        /* ── BADGE SHINE ── */
        .badge-shine {
          background: linear-gradient(90deg,#7c3aed,#b91c1c,#7c3aed,#0f766e,#a21caf,#7c3aed);
          background-size: 300% auto;
          animation: shimmerBadge 4s ease infinite;
          box-shadow: 0 0 28px rgba(139,92,246,.6), 0 6px 28px rgba(236,72,153,.4), inset 0 1px 0 rgba(255,255,255,.14);
          border-radius: 999px;
        }
        .badge-shimmer {
          position:absolute;
          inset:0;
          border-radius:999px;
          background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.18) 50%,transparent 70%);
          background-size:200% 100%;
          animation: shineSwipe 3.5s ease-in-out infinite;
        }
        @keyframes shineSwipe {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Ensure hero z20 for content */
        .hero-content-z { position:relative; z-index:20; }

        /* ── GRADIENT BRAND TEXT ── */
        .brand-gmt {
          background: linear-gradient(135deg, #fffde7 0%, #fde68a 28%, #fbbf24 55%, #f97316 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 30px rgba(251,191,36,.9)) drop-shadow(0 0 65px rgba(251,191,36,.5));
          animation: goldPulse 3s ease-in-out infinite;
        }
        .brand-mart {
          background: linear-gradient(135deg, #f0e6ff 0%, #c4b5fd 28%, #a78bfa 55%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 28px rgba(167,139,250,.85)) drop-shadow(0 0 58px rgba(124,58,237,.5));
          animation: purplePulse 3.5s ease-in-out infinite .5s;
        }
        @keyframes goldPulse {
          0%,100% { filter: drop-shadow(0 0 24px rgba(251,191,36,.85)) drop-shadow(0 0 55px rgba(251,191,36,.45)); }
          50%      { filter: drop-shadow(0 0 42px rgba(251,191,36,1))   drop-shadow(0 0 88px rgba(251,191,36,.7)); }
        }
        @keyframes purplePulse {
          0%,100% { filter: drop-shadow(0 0 22px rgba(167,139,250,.8))  drop-shadow(0 0 50px rgba(124,58,237,.45)); }
          50%      { filter: drop-shadow(0 0 38px rgba(167,139,250,.98)) drop-shadow(0 0 76px rgba(124,58,237,.65)); }
        }

        /* ── GLASSMORPHISM HERO CARD ── */
        .glass-hero {
          background: linear-gradient(
            150deg,
            rgba(255,255,255,.044) 0%,
            rgba(124,58,237,.055)  45%,
            rgba(6,182,212,.025)   100%
          );
          border: 1px solid rgba(255,255,255,.09);
          backdrop-filter: blur(28px) saturate(1.5);
          -webkit-backdrop-filter: blur(28px) saturate(1.5);
          box-shadow:
            0 32px 96px rgba(0,0,0,.72),
            inset 0 1px 0 rgba(255,255,255,.1),
            0 0 0 1px rgba(124,58,237,.18),
            0 0 70px rgba(124,58,237,.07);
        }

        /* ── COUNTDOWN ── */
        .countdown-box {
          background: rgba(0,0,0,.58);
          border: 1px solid rgba(255,255,255,.1);
          backdrop-filter: blur(14px);
          box-shadow: 0 4px 26px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06);
          transition: transform .22s ease;
          min-width: 60px;
        }
        .countdown-box:hover { transform: translateY(-3px); }
        .countdown-colon {
          font-size: 1.5rem;
          font-weight: 900;
          color: rgba(255,255,255,.22);
          line-height: 1;
          margin-bottom: 12px;
        }

        /* ── AURORA BLOBS ── */
        @keyframes auroraFloat {
          0%,100% { transform: translate(0%,0%)    scale(1);    opacity:.55; }
          33%      { transform: translate(5%,-7%)  scale(1.14); opacity:.72; }
          66%      { transform: translate(-5%,6%)  scale(0.9);  opacity:.48; }
        }
        .aurora-blob {
          animation: auroraFloat var(--adur,18s) ease-in-out var(--adelay,0s) infinite;
        }

        /* ── STAT CARDS ── */
        .stat-card {
          background: rgba(0,0,0,.5);
          border: 1px solid rgba(255,255,255,.08);
          backdrop-filter: blur(14px);
          transition: transform .25s ease, box-shadow .25s ease;
          box-shadow: 0 4px 18px rgba(0,0,0,.45);
          min-width: 70px;
        }

        /* ── MOBILE — kill every backdrop-filter and animation that uses GPU layers ── */
        @media (max-width: 767px) {
          .glass-hero, .countdown-box, .stat-card {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background: rgba(0,0,0,0.72) !important;
          }
          .aurora-blob { display: none !important; }
          .tw-star     { display: none !important; }
          .ring-cw, .ring-ccw { display: none !important; }
          .ticker-wrap::before, .ticker-wrap::after { display: none; }
        }
        .stat-card:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 10px 32px rgba(0,0,0,.6);
        }

        /* ── TICKER FADE EDGES ── */
        .ticker-wrap { position: relative; }
        .ticker-wrap::before,
        .ticker-wrap::after {
          content:"";
          position:absolute;
          top:0; bottom:0;
          width:90px;
          z-index:2;
          pointer-events:none;
        }
        .ticker-wrap::before {
          left:0;
          background: linear-gradient(to right, rgba(5,0,16,1) 0%, transparent 100%);
        }
        .ticker-wrap::after {
          right:0;
          background: linear-gradient(to left, rgba(5,0,16,1) 0%, transparent 100%);
        }
      `}</style>

      <div className="flex w-full overflow-hidden" style={{ height:"100svh", minHeight:"-webkit-fill-available" }}>

        {/* ══════════════════════════════════════════════
            LEFT — CATEGORY SIDEBAR
        ══════════════════════════════════════════════ */}
        <aside
          ref={asideRef}
          className="sidebar-bg flex flex-col h-full z-10 shadow-2xl"
          style={{ width:"38%", minWidth:255, maxWidth:440 }}
        >
          {/* Header */}
          <div className="cat-header-bg flex-shrink-0 px-4 pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background:"linear-gradient(135deg,#7c3aed,#4c1d95)", boxShadow:"0 0 18px rgba(124,58,237,.7)" }}>
                <ShoppingBag className="w-[18px] h-[18px] text-white" />
              </div>
              <div>
                <p className="text-white font-black text-[13px] leading-none tracking-wide">All Categories</p>
                <p className="text-violet-400 text-[10px] mt-0.5">{CATEGORIES.length} Depts · 200+ Sub-cats</p>
              </div>
              <span className="ml-auto text-[9px] font-bold px-2 py-1 rounded-full text-violet-300 border border-violet-600/50 bg-violet-900/40 uppercase tracking-widest">
                Browse
              </span>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-violet-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search categories & items…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="search-box w-full pl-8 pr-3 py-2 rounded-lg text-[12px]"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto cat-scroll">
            {filtered.length === 0 && (
              <div className="text-center text-violet-500 text-xs py-10">Nothing found for "{query}"</div>
            )}
            {filtered.map((cat) => {
              const isOpen  = openCat === cat.id;
              const totalSubs = cat.subcats.reduce((a, s) => a + s.items.length, 0);
              return (
                <div key={cat.id} className={`cat-row-item ${isOpen ? "active-cat":""}`}>

                  {/* Row */}
                  <button
                    onClick={() => toggleCat(cat.id)}
                    onMouseEnter={() => setHoverCat(cat.id)}
                    onMouseLeave={() => setHoverCat(null)}
                    className="w-full flex items-center gap-3 px-4 py-[10px] text-left"
                    style={{ borderLeft: `3px solid ${isOpen ? cat.accent:"transparent"}` }}
                  >
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                      style={{
                        background: `linear-gradient(135deg,${cat.from},${cat.to})`,
                        boxShadow: isOpen ? `0 0 16px ${cat.accent}88`:"none",
                      }}
                    >
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-white truncate">{cat.label}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{cat.subcats.length} sub-cats</p>
                    </div>
                    <span
                      className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full mr-1"
                      style={{ background:`${cat.accent}22`, color:cat.accent, border:`1px solid ${cat.accent}44` }}
                    >
                      {totalSubs}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: isOpen ? cat.accent:"rgba(255,255,255,.3)" }} />
                    </motion.div>
                  </button>

                  {/* Sub-cat accordion */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="sub"
                        initial={{ height:0, opacity:0 }}
                        animate={{ height:"auto", opacity:1 }}
                        exit={{ height:0, opacity:0 }}
                        transition={{ duration:0.24, ease:[0.4,0,0.2,1] }}
                        className="overflow-hidden"
                        style={{ background:"rgba(0,0,0,.3)" }}
                      >
                        {cat.subcats.map((sub) => {
                          const k = `${cat.id}__${sub.label}`;
                          const subOpen = !!openSub[k];
                          return (
                            <div key={sub.label}>
                              <button
                                onClick={(e) => sub.items.length ? toggleSub(e, cat.id, sub.label) : undefined}
                                className="w-full flex items-center gap-2 pl-9 pr-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                              >
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:cat.accent }} />
                                <span className="flex-1 text-[11px] font-semibold text-white/70 truncate">{sub.label}</span>
                                {sub.items.length > 0 && (
                                  <>
                                    <span className="text-[9px] text-white/25 mr-1">{sub.items.length}</span>
                                    <motion.div animate={{ rotate: subOpen ? 90:0 }} transition={{ duration:0.15 }}>
                                      <ChevronRight className="w-3 h-3 text-white/30" />
                                    </motion.div>
                                  </>
                                )}
                              </button>
                              <AnimatePresence initial={false}>
                                {subOpen && sub.items.length > 0 && (
                                  <motion.div
                                    initial={{ height:0, opacity:0 }}
                                    animate={{ height:"auto", opacity:1 }}
                                    exit={{ height:0, opacity:0 }}
                                    transition={{ duration:0.18 }}
                                    className="overflow-hidden"
                                    style={{ background:"rgba(0,0,0,.18)" }}
                                  >
                                    {sub.items.map((item) => (
                                      <Link
                                        key={item}
                                        to={`/shop?q=${encodeURIComponent(item)}`}
                                        className="group flex items-center gap-2 pl-14 pr-4 py-1.5 text-[11px] text-white/35 hover:text-white/90 transition-colors duration-150"
                                      >
                                        <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-white flex-shrink-0" />
                                        <span className="truncate">{item}</span>
                                      </Link>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="flex-shrink-0 px-4 py-2.5 flex items-center justify-center"
            style={{ borderTop:"1px solid rgba(124,58,237,.25)", background:"rgba(0,0,0,.4)" }}
          >
            <span className="text-violet-500 text-[10px] font-black uppercase tracking-widest">GMT MART &copy; 2026</span>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════
            RIGHT — PRE-LAUNCH HERO
        ══════════════════════════════════════════════ */}
        <section ref={heroRef} className="flex-1 h-full relative overflow-hidden hero-bg">

          {/* Animated grid */}
          <div className="hero-grid absolute inset-0 pointer-events-none z-0" />

          {/* Scan line */}
          <div className="scan-line absolute left-0 right-0 h-[1.5px] pointer-events-none z-0"
            style={{ background:"linear-gradient(90deg,transparent,rgba(251,191,36,.45),rgba(251,191,36,.8),rgba(251,191,36,.45),transparent)" }} />

          {/* THREE.JS CANVAS — full fill (desktop only; skipped on mobile to prevent OOM crash) */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {!isMobile && (
              <CanvasErrorBoundary>
                <Canvas
                  dpr={[1, 1.5]}
                  camera={{ position:[0,0,3.5], fov:55 }}
                  gl={{ powerPreference:"low-power", antialias:false }}
                >
                  <Scene3D />
                </Canvas>
              </CanvasErrorBoundary>
            )}
            {/* Vignette overlay */}
            <div className="canvas-vignette absolute inset-0" />
          </div>

          {/* Aurora blobs — desktop only; blur(75px)×7 OOM-crashes mobile Safari */}
          {!isMobile && [
            { c:"rgba(124,58,237,.32)",  w:520, t:"-8%",  l:"-12%", adur:"16s", adelay:"0s"  },
            { c:"rgba(236,72,153,.26)",  w:440, t:"-5%",  r:"-10%", adur:"13s", adelay:"3s"  },
            { c:"rgba(6,182,212,.20)",   w:400, b:"-5%",  l:"8%",   adur:"19s", adelay:"6s"  },
            { c:"rgba(251,191,36,.18)",  w:360, b:"-8%",  r:"3%",   adur:"22s", adelay:"9s"  },
            { c:"rgba(16,185,129,.18)",  w:320, t:"28%",  l:"-8%",  adur:"17s", adelay:"4s"  },
            { c:"rgba(249,115,22,.16)",  w:290, t:"22%",  r:"-6%",  adur:"20s", adelay:"7s"  },
            { c:"rgba(99,102,241,.20)",  w:380, t:"55%",  l:"18%",  adur:"24s", adelay:"11s" },
          ].map((b, i) => (
            <div key={i} className="aurora-blob absolute rounded-full pointer-events-none z-0"
              style={{
                "--adur": b.adur,
                "--adelay": b.adelay,
                width: b.w, height: b.w,
                background: `radial-gradient(circle, ${b.c}, transparent 70%)`,
                top: b.t, left: b.l, right: b.r, bottom: b.b,
                filter: "blur(75px)",
              }}
            />
          ))}

          {/* Stars — desktop only */}
          {!isMobile && Array.from({ length:34 }).map((_,i)=>(
            <div key={i} className="tw-star absolute rounded-full bg-white pointer-events-none z-0"
              style={{
                "--td": `${1.3+(i%7)*0.28}s`,
                width: i%5===0?3:i%3===0?2:1, height:i%5===0?3:i%3===0?2:1,
                top:`${(i*29+7)%93}%`, left:`${(i*43+11)%93}%`,
                animationDelay:`${(i*0.09)%2.8}s`,
              }}
            />
          ))}

          {/* Floating emoji stickers */}
          {[
            { e:"🎁",t:"9%",  l:"9%",  d:0,   s:38,dur:"4.2s" },
            { e:"✨",t:"16%", r:"8%",  d:0.6, s:30,dur:"3.8s" },
            { e:"💰",t:"39%", l:"5%",  d:1.1, s:40,dur:"5.0s" },
            { e:"🛍️",t:"57%", r:"11%", d:1.6, s:36,dur:"4.5s" },
            { e:"💎",t:"24%", r:"26%", d:0.3, s:28,dur:"3.5s" },
            { e:"👗",b:"29%", l:"7%",  d:0.9, s:34,dur:"4.8s" },
            { e:"⭐",b:"18%", r:"15%", d:1.3, s:28,dur:"3.9s" },
            { e:"🚀",t:"75%", l:"17%", d:0.7, s:36,dur:"5.2s" },
            { e:"💸",t:"47%", r:"5%",  d:1.9, s:30,dur:"4.1s" },
            { e:"🔥",t:"85%", r:"25%", d:1.0, s:32,dur:"4.3s" },
          ].map((s,i)=>(
            <div key={i} className="float-sticker absolute select-none pointer-events-none z-20"
              style={{ "--dur":s.dur, top:s.t, left:s.l, right:s.r, bottom:s.b,
                fontSize:s.s, animationDelay:`${s.d}s`,
                filter:"drop-shadow(0 3px 14px rgba(255,255,255,.32))", lineHeight:1 }}>
              {s.e}
            </div>
          ))}

          {/* Orbit rings — desktop only */}
          {!isMobile && <div className="absolute pointer-events-none" style={{ top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:0, height:0, zIndex:11 }}>
            {[
              { size:420, sp:"20s", dir:"ring-cw",  dot:"#fbbf24", dotPos:"top-[-7px] left-1/2 -translate-x-1/2" },
              { size:310, sp:"11s", dir:"ring-ccw", dot:"#a78bfa", dotPos:"bottom-[-6px] left-1/2 -translate-x-1/2" },
              { size:540, sp:"30s", dir:"ring-cw",  dot:"#22d3ee", dotPos:"top-1/4 right-[-5px]" },
            ].map((r,i)=>(
              <div key={i} className={`${r.dir} absolute`}
                style={{
                  "--sp":r.sp,
                  width:r.size, height:r.size,
                  top:"50%", left:"50%",
                  marginTop: -(r.size/2), marginLeft: -(r.size/2),
                  border:"1px dashed rgba(255,255,255,.1)",
                  borderRadius:"50%",
                }}>
                <div className={`absolute w-3 h-3 rounded-full ${r.dotPos}`}
                  style={{ background:r.dot, boxShadow:`0 0 12px ${r.dot}` }} />
              </div>
            ))}
          </div>}

          {/* Corner ribbon badges */}
          <motion.div
            initial={{ scale:0, rotate:20, opacity:0 }}
            animate={{ scale:1, rotate:12, opacity:1 }}
            transition={{ type:"spring", bounce:0.65, delay:1.0 }}
            className="absolute top-4 right-5 z-30"
          >
            <Card3D>
              <div className="text-yellow-950 text-[9px] font-black px-3 py-1.5 rounded-2xl uppercase tracking-widest border-2 border-yellow-300 cursor-default"
                style={{ background:"linear-gradient(135deg,#fde68a,#fbbf24)", boxShadow:"0 4px 22px rgba(251,191,36,.55)" }}>
                🚀 Launching Soon!
              </div>
            </Card3D>
          </motion.div>
          <motion.div
            initial={{ scale:0, rotate:-15, opacity:0 }}
            animate={{ scale:1, rotate:-8, opacity:1 }}
            transition={{ type:"spring", bounce:0.65, delay:1.2 }}
            className="absolute top-4 left-4 z-30"
          >
            <Card3D>
              <div className="text-green-950 text-[9px] font-black px-3 py-1.5 rounded-2xl uppercase tracking-widest border-2 border-green-300 cursor-default"
                style={{ background:"linear-gradient(135deg,#bbf7d0,#34d399)", boxShadow:"0 4px 22px rgba(52,211,153,.5)" }}>
                🆓 Free to Join!
              </div>
            </Card3D>
          </motion.div>

          {/* ── MAIN CONTENT ── */}
          <div className="hero-content-z h-full flex flex-col items-center justify-center px-8 lg:px-14 text-center pb-10">

            {/* Badge */}
            <div ref={badgeRef} style={{ opacity:0 }} className="mb-4">
              <div className="relative inline-block">
                <span className="badge-shine inline-flex items-center gap-2 text-white text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-[0.22em] relative overflow-hidden">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  ✦  PRE-LAUNCH — EXCLUSIVE ACCESS  ✦
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span className="badge-shimmer" />
                </span>
              </div>
            </div>

            {/* Brand */}
            <div ref={brandRef} style={{ opacity:0 }} className="mb-3 flex items-baseline gap-5">
              <span className="brand-gmt font-black leading-none"
                style={{ fontSize:"clamp(3.5rem,8.5vw,6.2rem)", letterSpacing:"-0.03em" }}>
                GMT
              </span>
              <span className="brand-mart font-black leading-none"
                style={{ fontSize:"clamp(3.5rem,8.5vw,6.2rem)", letterSpacing:"-0.03em" }}>
                MART
              </span>
            </div>

            {/* Tagline */}
            <p ref={tagRef} style={{ opacity:0, color:"rgba(196,181,253,.72)", letterSpacing:"0.22em" }}
              className="text-[11px] font-bold uppercase mb-2">
              {TAGLINE}
            </p>

            {/* Divider */}
            <div ref={divRef} className="origin-center flex items-center gap-3 mb-5">
              <div style={{ width:60, height:1, background:"linear-gradient(90deg,transparent,rgba(167,139,250,.7))" }} />
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#fbbf24", boxShadow:"0 0 14px #fbbf24, 0 0 28px rgba(251,191,36,.5)" }} />
              <div style={{ width:60, height:1, background:"linear-gradient(90deg,rgba(167,139,250,.7),transparent)" }} />
            </div>

            {/* Countdown Timer */}
            <div className="mb-6 flex flex-col items-center gap-2.5">
              <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.22em] flex items-center gap-1.5">
                <Timer className="w-3 h-3 text-yellow-400/60" />
                Official Launch In
              </p>
              <div className="flex items-center gap-2">
                {[
                  { value: time.d, label: "Days",  color: "#fbbf24" },
                  { value: time.h, label: "Hours", color: "#a78bfa" },
                  { value: time.m, label: "Mins",  color: "#34d399" },
                  { value: time.s, label: "Secs",  color: "#f87171" },
                ].map(({ value, label, color }, idx) => (
                  <React.Fragment key={label}>
                    <div className="countdown-box flex flex-col items-center justify-center rounded-xl px-3 py-2">
                      <span style={{
                        fontSize:"1.55rem", fontWeight:900, color,
                        letterSpacing:"-0.03em", lineHeight:1,
                        textShadow:`0 0 18px ${color}cc, 0 0 38px ${color}66`
                      }}>
                        {String(value).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize:"8px", color:"rgba(255,255,255,.38)", textTransform:"uppercase", letterSpacing:"0.12em", marginTop:3 }}>
                        {label}
                      </span>
                    </div>
                    {idx < 3 && <span className="countdown-colon">:</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Headline */}
            <h2 ref={subhRef} style={{ opacity:0 }}
              className="text-[1.65rem] lg:text-[2rem] font-black text-white mb-3 leading-tight">
              Shop Smart.{" "}
              <span style={{
                background:"linear-gradient(90deg, #a78bfa, #c084fc, #e879f9)",
                WebkitBackgroundClip:"text",
                WebkitTextFillColor:"transparent",
                backgroundClip:"text",
              }}>Earn More.</span>
              <br />
              <span style={{
                background:"linear-gradient(90deg,#fde68a,#fbbf24,#f97316)",
                WebkitBackgroundClip:"text",
                WebkitTextFillColor:"transparent",
                backgroundClip:"text",
                filter:"drop-shadow(0 0 18px rgba(251,191,36,.65))",
              }}>Live Better.</span>
            </h2>

            <p ref={descRef} style={{ opacity:0, color:"rgba(200,195,230,.78)" }}
              className="text-[13px] max-w-[360px] mb-6 leading-relaxed">
              India's first marketplace with{" "}
              <strong style={{ color:"#c4b5fd", fontWeight:700 }}>100% cashback in 50 months</strong>,
              <strong style={{ color:"#fcd34d", fontWeight:700 }}> ₹1000 voucher</strong>, free COD &amp; 5-level referral income.
            </p>

            {/* Pills */}
            <div className="flex flex-wrap justify-center gap-2 max-w-[440px] mb-6">
              {[
                { icon:"🎁", text:"Rs.1000 Voucher",  ac:"#fbbf24" },
                { icon:"💰", text:"100% Cashback",    ac:"#34d399" },
                { icon:"🚚", text:"Free COD",          ac:"#60a5fa" },
                { icon:"⭐", text:"10% Referral",      ac:"#a78bfa" },
                { icon:"📦", text:"500+ Products",    ac:"#f87171" },
                { icon:"🔒", text:"100% Secure",      ac:"#22d3ee" },
              ].map((p,i)=>(
                <div key={i} className="pill-item inline-flex items-center gap-1.5 text-[11.5px] font-bold px-3.5 py-1.5 rounded-full cursor-default"
                  style={{
                    opacity:0,
                    color:p.ac,
                    background:`${p.ac}14`,
                    border:`1px solid ${p.ac}45`,
                    backdropFilter:"blur(12px)",
                    animationDelay:`${i*0.6}s`,
                    boxShadow:`0 2px 14px ${p.ac}22, inset 0 1px 0 rgba(255,255,255,.06)`,
                    textShadow:`0 0 12px ${p.ac}88`,
                  }}>
                  <span className="text-sm leading-none">{p.icon}</span>{p.text}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div ref={btnRef} style={{ opacity:0 }}
              className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[380px]">
              <Card3D className="w-full">
                <Link to="/agent/register"
                  className="btn-agent w-full flex items-center justify-center gap-2 py-4 px-5 rounded-2xl font-black text-sm hover:brightness-110 transition-all duration-200 group"
                  style={{
                    background:"linear-gradient(135deg,#fde68a 0%,#fbbf24 45%,#f97316 100%)",
                    color:"#1a0a00",
                    boxShadow:"0 0 0 2px rgba(251,191,36,.4), 0 8px 32px rgba(251,191,36,.5), inset 0 1px 0 rgba(255,255,255,.35)",
                  }}>
                  <Users className="w-[17px] h-[17px]" />
                  <span>Become a Sales Agent</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Card3D>
            </div>

            {/* Sign in */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[11px] font-medium" style={{ color:"rgba(220,210,255,.75)" }}>Already a member?</span>
              <Link to="/login"
                className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full transition-all duration-200"
                style={{
                  color:"#fbbf24",
                  background:"rgba(251,191,36,.1)",
                  border:"1px solid rgba(251,191,36,.35)",
                  textShadow:"0 0 12px rgba(251,191,36,.7)",
                }}>
                Sign In <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-4 gap-2 w-full max-w-[380px]">
              {[
                { num:"500+", label:"Products",    color:"#fbbf24", icon:"📦", from:"rgba(251,191,36,.14)", bdr:"#fbbf2455" },
                { num:"16+",  label:"Categories",  color:"#a78bfa", icon:"🗂️", from:"rgba(167,139,250,.14)", bdr:"#a78bfa55" },
                { num:"50mo", label:"Cashback",    color:"#34d399", icon:"💰", from:"rgba(52,211,153,.14)",  bdr:"#34d39955" },
                { num:"₹1K",  label:"Voucher",     color:"#f87171", icon:"🎁", from:"rgba(248,113,113,.14)",bdr:"#f8717155" },
              ].map(({ num, label, color, icon, from, bdr })=>(
                <div key={label} className="stat-card stat-item rounded-2xl px-2 py-3 text-center flex flex-col items-center"
                  style={{
                    opacity:0,
                    background:from,
                    border:`1px solid ${bdr}`,
                    backdropFilter:"blur(18px)",
                    boxShadow:`0 4px 18px ${color}18, inset 0 1px 0 rgba(255,255,255,.07)`,
                  }}>
                  <span className="text-[18px] leading-none mb-1">{icon}</span>
                  <div className="font-black text-[1.1rem] leading-none"
                    style={{ color, textShadow:`0 0 14px ${color}bb, 0 0 28px ${color}55` }}>
                    {num}
                  </div>
                  <div className="mt-1 text-[8px] uppercase tracking-widest font-bold" style={{ color:"rgba(220,210,255,.5)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticker */}
          <div className="ticker-wrap absolute bottom-0 left-0 right-0 overflow-hidden py-2 z-20"
            style={{
              background:"linear-gradient(90deg,rgba(124,58,237,.35),rgba(236,72,153,.25),rgba(6,182,212,.2),rgba(124,58,237,.35))",
              backdropFilter:"blur(14px)",
              borderTop:"1px solid rgba(255,255,255,.09)",
            }}>
            <div className="ticker-inner">
              {[...TICKER_ITEMS,...TICKER_ITEMS].map((t,i)=>(
                <span key={i} className="text-white/70 text-[11px] font-semibold mx-8">
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
                    style={{ background:["#fbbf24","#a78bfa","#34d399","#f87171"][i%4] }} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
