import { useEffect, useState } from 'react';

interface Props { url: string; onDone: () => void }

export default function OrderAnimation({ url, onDone }: Props) {
  const [showBtn, setShowBtn] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => { setShowBtn(true); window.location.href = url; }, 5500);
    const t2 = setTimeout(onDone, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [url, onDone]);

  return (
    <div className="order-overlay">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', color: 'var(--gold)', fontWeight: 700, marginBottom: 30 }}>شكراً لك! ❤️</div>
        <div className="box-wrapper">
          <div className="box-part box-front"><span>oudélle</span></div>
          <div className="box-part box-back" />
          <div className="box-part box-left" />
          <div className="box-part box-right" />
          <div className="box-part box-bottom" />
          <div className="box-part box-top">
            <div className="ribbon" style={{ width: 20, height: '100%', left: 90, top: 0, transform: 'translateZ(1px)' }} />
          </div>
          <div className="ribbon" style={{ width: '100%', height: 20, left: 0, top: 40, transform: 'translateZ(51px)' }} />
          <div className="ribbon" style={{ width: 20, height: '100%', left: 90, top: 0, transform: 'translateZ(51px)' }} />
        </div>
        <div style={{ fontSize: '1.2rem', marginTop: 20, color: '#cbd5e1', opacity: showBtn ? 1 : 0, transition: 'opacity 1s' }}>
          جاري تجهيز طلبك وتغليفه بكل حب... 🎁
        </div>
        {showBtn && (
          <button onClick={() => { window.location.href = url; }} style={{
            background: '#25d366', color: '#fff', border: 'none', padding: '10px 25px',
            borderRadius: 25, fontSize: '1rem', marginTop: 20, cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(37,211,102,.3)', fontFamily: "'Cairo',sans-serif",
          }}>
            إرسال عبر واتساب الآن 🟢
          </button>
        )}
      </div>
    </div>
  );
}
