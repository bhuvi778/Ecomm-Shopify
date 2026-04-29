import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Star, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard.jsx';
import ProductModal from '../components/ProductModal.jsx';
import api from '../api/axios.js';

const CATEGORIES = [
  { key: '',        label: 'All Products', emoji: '🛍️' },
  { key: 'saree',   label: 'Sarees',       emoji: '🥻' },
  { key: 'suit',    label: 'Suits',        emoji: '👘' },
  { key: 'jeans',   label: 'Jeans',        emoji: '👖' },
  { key: 'tshirt',  label: 'T-Shirts',     emoji: '👕' },
  { key: 'kurta',   label: 'Kurtas',       emoji: '🧥' },
  { key: 'lehenga', label: 'Lehengas',     emoji: '💃' },
];

const SORT_OPTIONS = [
  { value: '',           label: 'Relevance'    },
  { value: 'price_asc',  label: '₹ Low → High' },
  { value: 'price_desc', label: '₹ High → Low' },
  { value: 'newest',     label: 'Newest First'  },
  { value: 'rating',     label: 'Top Rated'     },
];

const RATING_OPTIONS = [
  { value: '',  label: 'All Ratings' },
  { value: '4', label: '4★ & Above'  },
  { value: '3', label: '3★ & Above'  },
];

const DISCOUNT_OPTIONS = [
  { value: '',   label: 'Any Discount' },
  { value: '10', label: '10% or more'  },
  { value: '30', label: '30% or more'  },
  { value: '50', label: '50% or more'  },
];

export default function Shop() {
  const { category: urlCategory } = useParams();
  const navigate = useNavigate();

  // Core filters
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [category, setCategory]       = useState(urlCategory || '');
  const [search, setSearch]           = useState('');
  const [draft, setDraft]             = useState('');
  const [sort, setSort]               = useState('');
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);

  // Advanced filters
  const [draftPriceMin, setDraftPriceMin] = useState('');
  const [draftPriceMax, setDraftPriceMax] = useState('');
  const [priceMin, setPriceMin]           = useState('');
  const [priceMax, setPriceMax]           = useState('');
  const [minRating, setMinRating]         = useState('');
  const [minDiscount, setMinDiscount]     = useState('');
  const [inStock, setInStock]             = useState(false);

  // UI state
  const [mobileFilter, setMobileFilter] = useState(false);
  const [quickView, setQuickView]       = useState(null);

  useEffect(() => {
    setCategory(urlCategory || '');
    setPage(1);
  }, [urlCategory]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (category)    params.set('category',    category);
    if (search)      params.set('search',      search);
    if (sort)        params.set('sort',        sort);
    if (priceMin)    params.set('minPrice',    priceMin);
    if (priceMax)    params.set('maxPrice',    priceMax);
    if (minRating)   params.set('minRating',   minRating);
    if (minDiscount) params.set('minDiscount', minDiscount);
    if (inStock)     params.set('inStock',     'true');
    api.get(`/products?${params}`)
      .then(r => {
        setProducts(r.data.products || []);
        setTotalPages(r.data.pages  || 1);
        setTotal(r.data.total       || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, search, sort, page, priceMin, priceMax, minRating, minDiscount, inStock]);

  const pickCategory = (key) => {
    setCategory(key);
    setPage(1);
    setMobileFilter(false);
    if (key) navigate(`/shop/${key}`, { replace: true });
    else     navigate('/shop',        { replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(draft);
    setPage(1);
  };

  const clearSearch = () => { setDraft(''); setSearch(''); setPage(1); };

  const applyPriceRange = () => {
    setPriceMin(draftPriceMin);
    setPriceMax(draftPriceMax);
    setPage(1);
  };

  const clearAllFilters = () => {
    pickCategory('');
    clearSearch();
    setSort('');
    setDraftPriceMin(''); setDraftPriceMax('');
    setPriceMin('');      setPriceMax('');
    setMinRating('');
    setMinDiscount('');
    setInStock(false);
    setPage(1);
  };

  const activeCat = CATEGORIES.find(c => c.key === category) || CATEGORIES[0];
  const activeFilterCount = [
    category !== '',
    search !== '',
    sort !== '',
    priceMin !== '' || priceMax !== '',
    minRating !== '',
    minDiscount !== '',
    inStock,
  ].filter(Boolean).length;

  // Sidebar rendered as a function so it merges into the parent fiber tree (no unmount/remount on rerender)
  const renderSidebar = () => (
    <div className="space-y-6">
      {/* Clear All */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full flex items-center justify-center gap-2 text-xs text-red-500 font-semibold bg-red-50 border border-red-100 rounded-xl py-2 hover:bg-red-100 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters ({activeFilterCount})
        </button>
      )}

      {/* Category */}
      <div>
        <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Category
        </h3>
        <div className="space-y-1">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => pickCategory(c.key)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                category === c.key
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-base leading-none">{c.emoji}</span>
              {c.label}
              {category === c.key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Price Range</h3>
        <div className="flex gap-2 items-center mb-2">
          <input
            type="number"
            placeholder="₹ Min"
            value={draftPriceMin}
            onChange={e => setDraftPriceMin(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-brand-400 bg-gray-50"
          />
          <span className="text-gray-300 text-sm shrink-0">—</span>
          <input
            type="number"
            placeholder="₹ Max"
            value={draftPriceMax}
            onChange={e => setDraftPriceMax(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-brand-400 bg-gray-50"
          />
        </div>
        <button
          onClick={applyPriceRange}
          className="w-full bg-brand-50 text-brand-700 border border-brand-200 rounded-xl py-2 text-sm font-semibold hover:bg-brand-100 transition"
        >
          Apply Range
        </button>
        {(priceMin || priceMax) && (
          <button
            onClick={() => { setPriceMin(''); setPriceMax(''); setDraftPriceMin(''); setDraftPriceMax(''); }}
            className="w-full text-xs text-gray-400 mt-1 hover:text-red-400 transition text-center"
          >
            ✕ Clear price filter
          </button>
        )}
      </div>

      {/* Customer Rating */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Customer Rating</h3>
        <div className="space-y-1">
          {RATING_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => { setMinRating(o.value); setPage(1); }}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                minRating === o.value
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {o.value ? (
                <>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Number(o.value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                    ))}
                  </span>
                  <span>{o.label}</span>
                </>
              ) : o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discount */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Discount</h3>
        <div className="space-y-1">
          {DISCOUNT_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => { setMinDiscount(o.value); setPage(1); }}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                minDiscount === o.value
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {o.value && (
                <span className="bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{o.value}%+</span>
              )}
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Availability</h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => { setInStock(v => !v); setPage(1); }}
            className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${inStock ? 'bg-brand-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${inStock ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700 select-none group-hover:text-brand-600 transition-colors">In Stock Only</span>
        </label>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sort By</h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => { setSort(o.value); setPage(1); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                sort === o.value
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">

      {/* Page header band */}
      <div className="bg-gradient-to-r from-brand-700 to-purple-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-brand-200 text-sm font-medium mb-1">GM Mart Store</p>
              <h1 className="font-display text-3xl md:text-4xl font-black">
                {activeCat.emoji} {activeCat.label}
              </h1>
              {total > 0 && <p className="text-brand-200 text-sm mt-1">{total} products found</p>}
            </div>
            {/* Search */}
            <form onSubmit={handleSearch} className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300 pointer-events-none" />
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Search fashion..."
                className="w-full bg-white/15 backdrop-blur border border-white/25 text-white placeholder-brand-200 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:bg-white/25 focus:border-white/50 transition"
              />
              {draft && (
                <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-200 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => pickCategory(c.key)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  category === c.key
                    ? 'bg-white text-brand-700 border-white shadow-md'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6">

          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-20 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 max-h-[calc(100vh-6rem)] overflow-y-auto">
              {renderSidebar()}
            </div>
          </aside>

          {/* Mobile filter FAB */}
          <div className="md:hidden fixed bottom-6 right-4 z-40">
            <button
              onClick={() => setMobileFilter(true)}
              className="flex items-center gap-2 bg-brand-600 text-white px-5 py-3 rounded-2xl shadow-xl font-semibold text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-brand-600 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile filter drawer */}
          <AnimatePresence>
            {mobileFilter && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMobileFilter(false)} />
                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26 }} className="md:hidden fixed right-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-gray-900 text-lg">Filters & Sort</h2>
                    <button onClick={() => setMobileFilter(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
                  </div>
                  {renderSidebar()}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product area */}
          <div className="flex-1 min-w-0">

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {category && (
                  <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-100 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {CATEGORIES.find(c => c.key === category)?.emoji} {CATEGORIES.find(c => c.key === category)?.label}
                    <button onClick={() => pickCategory('')} className="ml-0.5 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-3 py-1.5 rounded-full">
                    "{search}" <button onClick={clearSearch} className="ml-0.5 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {(priceMin || priceMax) && (
                  <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-100 text-xs font-semibold px-3 py-1.5 rounded-full">
                    ₹{priceMin || '0'} – ₹{priceMax || '∞'}
                    <button onClick={() => { setPriceMin(''); setPriceMax(''); setDraftPriceMin(''); setDraftPriceMax(''); }} className="ml-0.5 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minRating && (
                  <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-100 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {minRating}★ & Above <button onClick={() => setMinRating('')} className="ml-0.5 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minDiscount && (
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {minDiscount}%+ Off <button onClick={() => setMinDiscount('')} className="ml-0.5 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {inStock && (
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-100 text-xs font-semibold px-3 py-1.5 rounded-full">
                    In Stock <button onClick={() => setInStock(false)} className="ml-0.5 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {sort && (
                  <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 border border-gray-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {SORT_OPTIONS.find(o => o.value === sort)?.label}
                    <button onClick={() => setSort('')} className="ml-0.5 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-72" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-display font-bold text-xl text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-400 text-sm">Try different filters or search terms</p>
                <button onClick={clearAllFilters} className="mt-5 btn-primary">Reset All Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                  <AnimatePresence>
                    {products.map((p, i) => (
                      <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <ProductCard product={p} onQuickView={setQuickView} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                      <button key={pg} onClick={() => setPage(pg)} className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${page === pg ? 'bg-brand-600 text-white shadow-md shadow-brand-200' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                        {pg}
                      </button>
                    ))}
                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick-View Modal */}
      <AnimatePresence>
        {quickView && <ProductModal product={quickView} onClose={() => setQuickView(null)} />}
      </AnimatePresence>
    </div>
  );
}

