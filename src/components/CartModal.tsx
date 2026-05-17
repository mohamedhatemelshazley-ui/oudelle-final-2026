import { useState } from 'react';
import type { AppDatabase, CartItem, DeliveryMethod } from '../types';

interface CartHook {
  cart: CartItem[];
  removeItem: (i: number) => void;
  clearCart: () => void;
  subtotal: number;
  count: number;
}

interface Props {
  cart: CartHook;
  database: AppDatabase;
  saveDatabase: (db: AppDatabase) => Promise<void>;
  whatsapp: string;
  onClose: () => void;
  showToast: (m: string) => void;
  onOrder: (url: string) => void;
}

export default function CartModal({ cart: c, database, saveDatabase, whatsapp, onClose, showToast, onOrder }: Props) {
  const [method, setMethod] = useState<DeliveryMethod>('delivery');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addr, setAddr] = useState('');
  const [table, setTable] = useState<number | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [vMsg, setVMsg] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [orderDate, setOrderDate] = useState('');
  const [orderTime, setOrderTime] = useState('');

  const areas = database.delivery ?? [];
  const [areaPrice, setAreaPrice] = useState(areas[0]?.price ?? 0);
  const shipping = method === 'delivery' ? areaPrice : 0;
  const total = (c.subtotal + shipping) * (1 - discount);

  const applyVoucher = () => {
    const code = voucherCode.toUpperCase();
    const v = database.vouchers ?? {};
    if (v[code]) {
      setDiscount(v[code]);
      setVMsg(`✅ تم تطبيق خصم ${v[code] * 100}%`);
    } else {
      setDiscount(0);
      setVMsg('❌ كود غير صحيح');
    }
  };

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num).then(() => showToast('تم نسخ الرقم 📋'));
  };

  const checkout = () => {
    if (!name) return alert('الاسم مطلوب');
    if (method !== 'dinein' && !confirm('هل قمت بالتحويل وتصوير لقطة الشاشة؟')) return;

    const orderNum = parseInt(localStorage.getItem('oudelle_order_counter') ?? '0') + 1;
    localStorage.setItem('oudelle_order_counter', String(orderNum));

    let text = `🌟 *طلب جديد من أوديل* 🌟\n`;
    text += `------------------------------------------\n`;
    text += `📦 *رقم الأوردر: #${orderNum}* 📦\n`;
    text += `------------------------------------------\n\n`;
    text += `👤 *بيانات العميل:*\n• الاسم: ${name}\n`;
    if (method !== 'dinein') text += `• الهاتف: ${phone}\n`;
    text += `\n📍 *تفاصيل الطلب:*\n`;
    const methAr = method === 'delivery' ? 'توصيل للمنزل 🏠' : method === 'pickup' ? 'استلام من الفرع 🥯' : 'داخل المطعم 🍽️';
    text += `• النوع: ${methAr}\n`;
    if (method === 'dinein') text += `• الطاولة: ${table}\n`;
    else { text += `• الدفع: InstaPay ✅\n`; if (method === 'delivery') text += `• العنوان: ${addr}\n`; }
    if (orderDate || orderTime) text += `• الموعد: ${orderDate || 'اليوم'} في ${orderTime || 'أقرب وقت'}\n`;
    text += `\n🧁 *الأصناف المطلوبة:*\n`;
    text += c.cart.map(it => `• ${it.name} — ${it.price.toFixed(2)} ج`).join('\n');
    text += `\n\n💰 *الحساب النهائي:*\n• الإجمالي: ${c.subtotal.toFixed(2)} ج\n`;
    if (discount > 0) text += `• الخصم: ${discount * 100}%\n`;
    if (method === 'delivery') text += `• التوصيل: ${shipping} ج\n`;
    text += `\n💵 *المطلوب دفعه: ${total.toFixed(2)} ج.م* 💵\n`;
    text += `------------------------------------------\nشكراً لاختياركم أوديل! ❤️✨`;

    const newDB = { ...database };
    newDB.stats = { ...newDB.stats, totalOrders: (newDB.stats?.totalOrders ?? 0) + 1, totalRevenue: (newDB.stats?.totalRevenue ?? 0) + c.subtotal };
    const orderObj = { num: orderNum, name, phone, addr, meth: method, table, items: [...c.cart], subtotal: c.subtotal, discount, shipping, total, date: new Date().toLocaleString('ar-EG'), scheduled: { date: orderDate, time: orderTime } };
    newDB.orders = [orderObj, ...(newDB.orders ?? [])].slice(0, 50);
    saveDatabase(newDB as AppDatabase);

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
    c.clearCart();
    onOrder(url);
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>فاتورة طلبك 🛍️</h2>

        {c.cart.length === 0 ? (
          <p style={{ textAlign: 'center' }}>السلة فارغة 🛒</p>
        ) : (
          <>
            {c.cart.map((item, i) => (
              <div key={i} className="cart-item">
                <div><b>{item.name}</b><div style={{ fontSize: '.85rem', color: '#666' }}>{item.price.toFixed(2)} ج.م</div></div>
                <button className="cart-remove" onClick={() => c.removeItem(i)}>حذف</button>
              </div>
            ))}

            <div style={{ background: 'var(--cream)', padding: 15, borderRadius: 20, margin: '20px 0' }}>
              <label>طريقة الاستلام:</label>
              <select className="weight-select" value={method} onChange={e => setMethod(e.target.value as DeliveryMethod)}>
                <option value="delivery">دليفري (توصيل)</option>
                <option value="pickup">استلام من الفرع</option>
                <option value="dinein">داخل المطعم</option>
              </select>

              {method !== 'dinein' && (
                <div style={{ margin: '10px 0' }}>
                  <p style={{ color: '#0d47a1', fontWeight: 900, marginBottom: 5 }}>الدفع عبر InstaPay:</p>
                  <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: 8 }}>01091031582</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <button className="ip-btn" onClick={() => copyNumber('01091031582')}>نسخ الرقم 📋</button>
                    <a href="https://ipn.eg/S/01091031582" target="_blank" rel="noreferrer" className="ip-btn" style={{ background: '#2196f3' }}>فتح التطبيق 📱</a>
                  </div>
                  <p style={{ fontSize: '.75rem', color: '#d81b60', marginTop: 8, fontWeight: 700 }}>(صور الشاشة بعد التحويل لإرسالها في الواتساب)</p>
                </div>
              )}

              {method === 'dinein' && (
                <div style={{ marginTop: 10 }}>
                  <label>اختر رقم الطاولة:</label>
                  <div className="tables-grid">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className={`table-card ${table === n ? 'selected' : ''}`} onClick={() => setTable(n)}>{n}</div>
                    ))}
                  </div>
                  <button className="ip-btn" style={{ width: '100%', background: 'var(--gold)', color: '#000', marginTop: 10 }}
                    onClick={() => { if (!table) return alert('اختر طاولة أولاً'); window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(`🔔 طلب مساعدة — طاولة رقم: ${table}`)}`); }}>
                    🔔 نداء للجرسون
                  </button>
                </div>
              )}

              {method === 'delivery' && (
                <div style={{ marginTop: 10 }}>
                  <label>منطقة التوصيل</label>
                  <select className="weight-select" onChange={e => setAreaPrice(Number(e.target.value))}>
                    {areas.map(a => <option key={a.name} value={a.price}>{a.name} ({a.price} ج)</option>)}
                  </select>
                </div>
              )}

              {method === 'delivery' && <input className="weight-select" placeholder="العنوان بالتفصيل" value={addr} onChange={e => setAddr(e.target.value)} />}
              {method !== 'dinein' && <input className="weight-select" type="tel" placeholder="رقم الهاتف" value={phone} onChange={e => setPhone(e.target.value)} />}

              {(method === 'delivery' || method === 'pickup') && (
                <button className="ip-btn" style={{ width: '100%', background: '#fff3e0', color: '#d84315', border: '1px solid #ffe0b2', marginTop: 10 }}
                  onClick={() => setShowSchedule(s => !s)}>🗓️ حجز موعد استلام مخصوص؟</button>
              )}
              {showSchedule && (
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <input type="date" className="weight-select" style={{ flex: 1 }} value={orderDate} onChange={e => setOrderDate(e.target.value)} />
                  <input type="time" className="weight-select" style={{ flex: 1 }} value={orderTime} onChange={e => setOrderTime(e.target.value)} />
                </div>
              )}
            </div>

            <input className="weight-select" placeholder="الاسم بالكامل" value={name} onChange={e => setName(e.target.value)} />

            <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px dashed #ddd' }}>
              <label style={{ fontSize: '.8rem' }}>هل لديك كود خصم؟</label>
              <div style={{ display: 'flex', gap: 5 }}>
                <input className="weight-select" style={{ flex: 1, marginBottom: 0 }} placeholder="كود الخصم" value={voucherCode} onChange={e => setVoucherCode(e.target.value)} />
                <button className="admin-btn" style={{ padding: '5px 15px' }} onClick={applyVoucher}>تطبيق</button>
              </div>
              {vMsg && <p style={{ fontSize: '.75rem', marginTop: 5, color: discount > 0 ? 'green' : 'red' }}>{vMsg}</p>}
            </div>

            <h3 style={{ textAlign: 'center', color: 'var(--gold)', margin: '15px 0 10px' }}>الإجمالي: {total.toFixed(2)} ج.م</h3>
            <button className="add-btn" style={{ background: '#25D366' }} onClick={checkout}>تأكيد وإرسال للمطعم ✅</button>
          </>
        )}
        <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', color: 'red', marginTop: 15, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" }}>إغلاق</button>
      </div>
    </div>
  );
}
