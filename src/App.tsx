import { useState, useCallback } from 'react';
import { useFirebaseDB } from './hooks/useFirebase';
import { useCart } from './hooks/useCart';
import Ticker from './components/Ticker';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuPage from './components/MenuPage';
import CartModal from './components/CartModal';
import AdminPanel from './components/AdminPanel';
import OrderAnimation from './components/OrderAnimation';
import Toast from './components/Toast';
import type { AppView } from './types';
import './index.css';

export default function App() {
  const { database, saveDatabase, getProducts, getImageUrl, isCloudActive } = useFirebaseDB();
  const cartHook = useCart();
  const [view, setView] = useState<AppView>('home');
  const [cartOpen, setCartOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [currentCat, setCurrentCat] = useState('oriental');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');
  const [orderUrl, setOrderUrl] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('oudelle_dark_mode') === 'true');
  const isRamadan = database.settings?.isRamadanMode ?? false;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark(p => {
      const next = !p;
      localStorage.setItem('oudelle_dark_mode', String(next));
      return next;
    });
  }, []);

  const bodyClass = [isDark ? 'dark-mode' : '', isRamadan ? 'ramadan-mode' : ''].filter(Boolean).join(' ');

  return (
    <div className={bodyClass}>
      <Ticker text={database.settings?.ticker ?? ''} />
      <Navbar
        cartCount={cartHook.count}
        onCartClick={() => { setCartOpen(c => !c); }}
        onLogoClick={() => setView('home')}
        onSearch={setSearchQuery}
        onToggleTheme={toggleDark}
        isDark={isDark}
      />

      {view === 'home' && (
        <Hero
          bg={database.settings?.homeBackground}
          onShowMenu={() => { setView('menu'); setSearchQuery(''); }}
        />
      )}

      {view === 'menu' && (
        <MenuPage
          database={database}
          currentCat={currentCat}
          setCurrentCat={setCurrentCat}
          searchQuery={searchQuery}
          getProducts={getProducts}
          getImageUrl={getImageUrl}
          cart={cartHook}
          showToast={showToast}
          onShowMenu={() => { setView('menu'); }}
        />
      )}

      {cartOpen && (
        <CartModal
          cart={cartHook}
          database={database}
          saveDatabase={saveDatabase}
          whatsapp={database.settings?.whatsapp ?? ''}
          onClose={() => setCartOpen(false)}
          showToast={showToast}
          onOrder={(url) => { setOrderUrl(url); setCartOpen(false); }}
        />
      )}

      {adminOpen && (
        <AdminPanel
          database={database}
          saveDatabase={saveDatabase}
          getImageUrl={getImageUrl}
          isCloudActive={isCloudActive}
          onClose={() => setAdminOpen(false)}
          showToast={showToast}
        />
      )}

      {orderUrl && (
        <OrderAnimation url={orderUrl} onDone={() => setOrderUrl(null)} />
      )}

      {toast && <Toast message={toast} />}

      <button
        onClick={() => setAdminOpen(true)}
        style={{
          position: 'fixed', bottom: 20, left: 20, background: 'linear-gradient(135deg, var(--primary), var(--gold))',
          color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 25, cursor: 'pointer',
          fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,.3)', zIndex: 2002,
          fontFamily: "'Cairo', sans-serif",
        }}
      >
        🎛️ لوحة التحكم
      </button>

      {isRamadan && (
        <div className="ramadan-compass" onClick={() => alert('بوصلة أوديل الرمضانية ✨')}>
          <span style={{ fontSize: '1.2rem' }}>🌙</span>
          <span style={{ fontSize: '.65rem', color: 'var(--gold)', textAlign: 'center', lineHeight: 1.1, fontWeight: 700 }}>رمضان كريم</span>
        </div>
      )}
    </div>
  );
}
