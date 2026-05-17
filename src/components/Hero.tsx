interface Props { bg?: string; onShowMenu: () => void }
export default function Hero({ bg, onShowMenu }: Props) {
  const bgStyle = bg
    ? { background: `url(${bg}) center/cover no-repeat` }
    : { background: 'linear-gradient(135deg, #07501a, #b38b2d)' };
  return (
    <section className="hero">
      <div className="hero-bg" style={bgStyle} />
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="hero-title">oudélle</h1>
        <p className="hero-sub">Desserts &amp; More — Since 1951</p>
        <button className="hero-btn" onClick={onShowMenu}>تصفح القائمة الكاملة</button>
      </div>
    </section>
  );
}
