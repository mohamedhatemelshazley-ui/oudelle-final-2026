import { useState } from 'react';
import type { AppDatabase, Product } from '../types';

interface CartHook {
  addPiece: (name: string, price: number, qty: number, opt?: string) => void;
  addKg: (name: string, price: number, weight: number, opt?: string) => void;
  count: number;
}

interface Props {
  database: AppDatabase;
  currentCat: string;
  setCurrentCat: (c: string) => void;
  searchQuery: string;
  getProducts: (cat: string) => Product[];
  getImageUrl: (img: string) => string;
  cart: CartHook;
  showToast: (msg: string) => void;
  onShowMenu: () => void;
}

export default function MenuPage({ database, currentCat, setCurrentCat, searchQuery, getProducts, getImageUrl, cart, showToast, onShowMenu }: Props) {
  const categories = database.categories ?? [];

  // Search across all categories
  const getSearchResults = (): { cat: string; product: Product; index: number }[] => {
    if (!searchQuery) return [];
    const results: { cat: string; product: Product; index: number }[] = [];
    for (const c of categories) {
      const prods = getProducts(c.id);
      prods.forEach((p, i) => {
        if (p.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ cat: c.id, product: p, index: i });
        }
      });
    }
    return results;
  };

  const searchResults = searchQuery ? getSearchResults() : null;
  const products = searchResults ? searchResults.map(r => r.product) : getProducts(currentCat);

  // Best sellers
  const bestSellers: Product[] = [];
  for (const c of categories) {
    getProducts(c.id).forEach(p => { if (p.isBestSeller) bestSellers.push(p); });
  }

  // Updates
  const updates = database.updates ?? [];

  return (
    <section style={{ display: 'block', paddingTop: 80 }}>
      {/* Category Tabs */}
      <div className="tabs-container">
        <div className="cat-tabs">
          {categories.map(c => (
            <button key={c.id} className={`tab ${currentCat === c.id && !searchQuery ? 'active' : ''}`}
              onClick={() => { setCurrentCat(c.id); }}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <div className="best-sellers">
          <h3 style={{ marginBottom: 10, fontSize: '1.1rem' }}>🔥 الأكثر مبيعاً هذا الأسبوع</h3>
          <div className="best-sellers-grid">
            {bestSellers.map((p, i) => {
              const img = getImageUrl(p.img);
              return (
                <div key={i} className="best-seller-item" onClick={() => { onShowMenu(); }}>
                  {img ? <img src={img} alt={p.name} /> : <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🍰</div>}
                  <p style={{ fontSize: '.8rem', marginTop: 5, fontWeight: 700 }}>{p.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search info */}
      {searchQuery && (
        <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
          {products.length > 0 ? `نتائج البحث عن "${searchQuery}"` : `لم يتم العثور على "${searchQuery}"`}
        </h2>
      )}

      {/* Product Grid */}
      <div className="grid">
        {products.map((p, i) => (
          <ProductCard key={`${currentCat}-${i}`} product={p} index={i} cat={currentCat} getImageUrl={getImageUrl} cart={cart} showToast={showToast} database={database} getProducts={getProducts} />
        ))}
      </div>

      {/* Updates */}
      {updates.length > 0 && (
        <div className="best-sellers" style={{ background: 'linear-gradient(90deg,#fff5f5,#fff)', borderRight: '5px solid #ff4d4d', marginTop: 30 }}>
          <h3 style={{ marginBottom: 10, fontSize: '1.1rem', color: '#d32f2f' }}>📢 تحديثات وأخبار oudélle</h3>
          <div className="best-sellers-grid">
            {updates.map((u, i) => (
              <div key={i} style={{ minWidth: 250, textAlign: 'right', background: '#fff', padding: 15, borderRadius: 15, boxShadow: '0 2px 10px rgba(0,0,0,.05)', flexShrink: 0 }}>
                {u.img && <img src={getImageUrl(u.img)} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />}
                <p style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 5 }}>{u.text}</p>
                <span style={{ fontSize: '.75rem', color: '#999' }}>{u.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      {(database.gallery?.length ?? 0) > 0 && (
        <>
          <h2 className="section-title">معرض الصور 📸</h2>
          <div className="gallery-grid">
            {database.gallery.map((url, i) => (
              <div key={i} className="gallery-item"><img src={url} alt="" loading="lazy" /></div>
            ))}
          </div>
        </>
      )}

      {/* Story */}
      <h2 className="section-title">قصتنا</h2>
      <div className="story-section">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
          بدأت رحلة oudélle عام 1951 بشغف صناعة الحلويات الشرقية الأصيلة.
          نتوارث سر الصنعة جيلاً بعد جيل، لنقدم لكم طعماً لا ينسى يجمع بين العراقة والحداثة.
        </p>
      </div>

      {/* Reviews */}
      <h2 className="section-title">آراء العملاء</h2>
      <div className="reviews-section">
        <div className="review-card">⭐⭐⭐⭐⭐<br />"أحلى بسبوسة أكلتها في حياتي، تسلم الأيادي!"<br /><b>- أحمد محمد</b></div>
        <div className="review-card">⭐⭐⭐⭐⭐<br />"الكنافة النابلسية بتوصل سخنة وطعمها تحفة."<br /><b>- سارة علي</b></div>
      </div>

      {/* Footer */}
      <footer>
        <p>© 2026 oudélle Desserts. All rights reserved.</p>
        <div style={{ marginTop: 10 }}>
          <a href="https://maps.app.goo.gl/6DHVYyxcTM3BcHKL8" target="_blank" rel="noreferrer">📍 موقعنا على الخريطة</a> |
          <a href="tel:+201023728183">📞 اتصل بنا</a>
        </div>
        <div style={{ marginTop: 15, fontSize: '.9rem', color: 'var(--gold)' }}>
          Designed by <a href="tel:01025693460" style={{ color: '#fff', textDecoration: 'underline' }}>Eng. Mohamed Hatem</a>
        </div>
      </footer>
    </section>
  );
}

/* ─── Product Card ──────────────────────────────────────────────────────── */
function ProductCard({ product: p, cat, getImageUrl, cart, showToast, database, getProducts }: {
  product: Product; index: number; cat: string; getImageUrl: (s: string) => string;
  cart: CartHook; showToast: (s: string) => void; database: AppDatabase; getProducts: (c: string) => Product[];
}) {
  const [qty, setQty] = useState(1);
  const [weight, setWeight] = useState(1);
  const [option, setOption] = useState('');
  const isSoldOut = p.inStock === false;
  const hasDiscount = p.isDiscount || (p.oldPrice && p.oldPrice > p.price);
  const imgUrl = getImageUrl(p.img);

  if (p.isMix) {
    const sourceItems = p.contents
      ? p.contents.map(name => { for (const c of (database.categories ?? [])) { const found = getProducts(c.id).find(x => x.name === name); if (found) return found; } return null; }).filter(Boolean) as Product[]
      : getProducts(p.source ?? cat).filter(x => !x.isMix);
    return (
      <div className={`card ${isSoldOut ? 'sold-out' : ''}`} style={{ gridColumn: '1/-1', background: 'var(--primary)', color: '#fff' }}>
        <h3 style={{ color: '#fff' }}>{p.title}</h3>
        {sourceItems.map((sub, si) => (
          <div key={si} style={{ display: 'flex', justifyContent: 'space-between', padding: 5, color: '#fff' }}>
            {sub.name} <input type="number" placeholder="جم" style={{ width: 60 }} />
          </div>
        ))}
        <button className="hero-btn" style={{ boxShadow: 'none', marginTop: 10, fontSize: '1rem', color: '#fff', border: '1px solid #fff' }} disabled={isSoldOut}>
          {isSoldOut ? 'غير متوفر حالياً' : 'إضافة'}
        </button>
      </div>
    );
  }

  const handleAdd = () => {
    if (p.type === 'kg') {
      cart.addKg(p.name, p.price, weight, option || undefined);
    } else {
      if (qty < 1) return;
      cart.addPiece(p.name, p.price, qty, option || undefined);
    }
    showToast(`تم إضافة ${p.name} للسلة 🛒`);
  };

  const displayPrice = p.type === 'kg' ? (p.price / 4).toFixed(2) : p.price;
  const oldDisplay = p.oldPrice ? (p.type === 'kg' ? (p.oldPrice / 4).toFixed(2) : p.oldPrice) : null;
  const unit = p.type === 'kg' ? 'ج/ربع كيلو' : 'ج.م';

  return (
    <div className={`card ${isSoldOut ? 'sold-out' : ''}`}>
      {p.isVIP && <div className="vip-badge">الشيف يرشحه 👑</div>}
      {imgUrl ? <img src={imgUrl} alt={p.name} /> : <div className="img-placeholder">🍰</div>}
      <h3>{p.name}</h3>
      {isSoldOut ? (
        <span className="out-of-stock-badge">غير متوفر حالياً</span>
      ) : (
        <>
          {hasDiscount && <div className="discount-badge">عرض خاص / خصم 🏷️</div>}
          {oldDisplay && <div><span className="old-price">{oldDisplay} ج</span></div>}
          <span className="price-badge">{displayPrice} {unit}</span>
        </>
      )}
      {p.options && p.options.length > 0 && (
        <select className="weight-select" disabled={isSoldOut} value={option} onChange={e => setOption(e.target.value)}>
          {p.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      {p.type === 'kg' ? (
        <select className="weight-select" disabled={isSoldOut} value={weight} onChange={e => setWeight(Number(e.target.value))}>
          <option value={0.25}>250جم</option>
          <option value={0.5}>500جم</option>
          <option value={0.75}>750جم</option>
          <option value={1}>1 كيلو</option>
        </select>
      ) : (
        <input type="number" className="qty-input" value={qty} min={1} disabled={isSoldOut} onChange={e => setQty(Number(e.target.value))} />
      )}
      <button className="add-btn" disabled={isSoldOut} onClick={handleAdd}>
        {isSoldOut ? 'غير متوفر' : 'إضافة'}
      </button>
    </div>
  );
}
