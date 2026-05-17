interface Props {
  cartCount: number;
  onCartClick: () => void;
  onLogoClick: () => void;
  onSearch: (q: string) => void;
  onToggleTheme: () => void;
  isDark: boolean;
}
export default function Navbar({ cartCount, onCartClick, onLogoClick, onSearch, onToggleTheme, isDark }: Props) {
  return (
    <nav>
      <span className="logo" onClick={onLogoClick}>oudélle</span>
      <div className="nav-controls">
        <input type="text" className="search-bar" placeholder="ابحث عن صنف..." onChange={e => onSearch(e.target.value)} />
        <button className="theme-toggle" onClick={onToggleTheme}>{isDark ? '☀️' : '🌙'}</button>
        <button className="cart-status" onClick={onCartClick}>🛒 <span>{cartCount}</span></button>
      </div>
    </nav>
  );
}
