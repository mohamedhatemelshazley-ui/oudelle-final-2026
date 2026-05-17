import { useState, useRef } from 'react';
import type { AppDatabase, Product } from '../types';

// ─── Image Compression ────────────────────────────────────────────────────
function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

interface Props {
  database: AppDatabase;
  saveDatabase: (db: AppDatabase) => Promise<void>;
  getImageUrl: (s: string) => string;
  isCloudActive: boolean;
  onClose: () => void;
  showToast: (m: string) => void;
}

export default function AdminPanel({ database, saveDatabase, getImageUrl, isCloudActive, onClose, showToast }: Props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pass, setPass] = useState('');
  const [admCat, setAdmCat] = useState(database.categories?.[0]?.id ?? 'oriental');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOldPrice, setNewOldPrice] = useState('');
  const [newType, setNewType] = useState<'kg' | 'piece'>('kg');
  const [newCat, setNewCat] = useState(admCat);
  const [newOptions, setNewOptions] = useState('');
  const [newImg, setNewImg] = useState('');
  const [editIdx, setEditIdx] = useState(-1);
  const [newCatName, setNewCatName] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaPrice, setNewAreaPrice] = useState('');
  const [newVCode, setNewVCode] = useState('');
  const [newVPerc, setNewVPerc] = useState('');
  const [waNum, setWaNum] = useState(database.settings?.whatsapp ?? '');
  const [tickerText, setTickerText] = useState(database.settings?.ticker ?? '');
  const [galleryUrl, setGalleryUrl] = useState('');
  const [homeBgPreview, setHomeBgPreview] = useState('');
  const productImgRef = useRef<HTMLInputElement>(null);
  const homeBgRef = useRef<HTMLInputElement>(null);
  const galleryImgRef = useRef<HTMLInputElement>(null);

  if (!loggedIn) {
    return (
      <div className="login-overlay">
        <div className="login-box">
          <h2 style={{ color: 'var(--primary)', marginBottom: 10 }}>🎛️ تسجيل دخول الأدمن</h2>
          <input type="password" placeholder="كلمة المرور" value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { if (pass === '55555') setLoggedIn(true); else showToast('❌ كلمة مرور خاطئة'); } }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="admin-btn" style={{ flex: 1 }} onClick={() => { if (pass === '55555') setLoggedIn(true); else showToast('❌ كلمة مرور خاطئة'); }}>دخول</button>
            <button className="admin-btn" style={{ flex: 1, background: '#dc3545' }} onClick={onClose}>إلغاء</button>
          </div>
        </div>
      </div>
    );
  }

  const categories = database.categories ?? [];
  const products: Product[] = (database[admCat] as Product[] | undefined) ?? [];
  const stats = database.stats ?? { totalOrders: 0, totalRevenue: 0 };
  const isRamadan = database.settings?.isRamadanMode ?? false;

  const save = async (newDB: AppDatabase) => {
    await saveDatabase(newDB);
    showToast('✅ تم الحفظ والمزامنة');
  };

  const toggleStock = (idx: number) => {
    const newDB = { ...database };
    const arr = [...products];
    arr[idx] = { ...arr[idx], inStock: arr[idx].inStock === false ? true : false };
    newDB[admCat] = arr;
    save(newDB as AppDatabase);
  };

  const toggleBestSeller = (idx: number) => {
    const newDB = { ...database };
    const arr = [...products];
    arr[idx] = { ...arr[idx], isBestSeller: !arr[idx].isBestSeller };
    newDB[admCat] = arr;
    save(newDB as AppDatabase);
  };

  const toggleVIP = (idx: number) => {
    const newDB = { ...database };
    const arr = [...products];
    arr[idx] = { ...arr[idx], isVIP: !arr[idx].isVIP };
    newDB[admCat] = arr;
    save(newDB as AppDatabase);
  };

  const toggleDiscount = (idx: number) => {
    const newDB = { ...database };
    const arr = [...products];
    arr[idx] = { ...arr[idx], isDiscount: !arr[idx].isDiscount };
    newDB[admCat] = arr;
    save(newDB as AppDatabase);
  };

  const deleteProduct = (idx: number) => {
    if (!confirm('حذف هذا المنتج؟')) return;
    const newDB = { ...database };
    const arr = [...products];
    arr.splice(idx, 1);
    newDB[admCat] = arr;
    save(newDB as AppDatabase);
  };

  const addOrEditProduct = () => {
    if (!newName || isNaN(Number(newPrice))) return alert('أكمل البيانات');
    const opts = newOptions ? newOptions.split('\n').map(s => s.trim()).filter(Boolean) : null;
    const p: Product = { name: newName, price: Number(newPrice), oldPrice: newOldPrice ? Number(newOldPrice) : null, type: newType, options: opts, img: newImg, inStock: true, isDiscount: false, isVIP: false };
    const newDB = { ...database };
    const arr = [...((newDB[newCat] as Product[] | undefined) ?? [])];
    if (editIdx >= 0) { arr[editIdx] = { ...arr[editIdx], ...p }; } else { arr.unshift(p); }
    newDB[newCat] = arr;
    save(newDB as AppDatabase);
    resetForm();
  };

  const startEdit = (idx: number) => {
    const p = products[idx];
    setNewName(p.name); setNewPrice(String(p.price)); setNewOldPrice(p.oldPrice ? String(p.oldPrice) : '');
    setNewType(p.type); setNewOptions(p.options?.join('\n') ?? ''); setNewImg(p.img ?? ''); setNewCat(admCat); setEditIdx(idx);
  };

  const resetForm = () => {
    setNewName(''); setNewPrice(''); setNewOldPrice(''); setNewOptions(''); setNewImg(''); setEditIdx(-1);
  };

  // ─── Image Handlers ────────────────────────────────────────────────────
  const handleProductImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const dataUrl = await compressImage(file, 800, 0.7);
      const fileName = 'prod_' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const newDB = { ...database, uploadedImages: { ...(database.uploadedImages ?? {}), [fileName]: dataUrl } };
      // Append to current image field
      setNewImg(prev => prev ? prev + ',' + fileName : fileName);
      await save(newDB as AppDatabase);
    } catch {
      alert('خطأ في رفع الصورة');
    }
    e.target.value = '';
  };

  const handleHomeBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const dataUrl = await compressImage(file, 1024, 0.8);
      setHomeBgPreview(dataUrl);
      await save({ ...database, settings: { ...database.settings, homeBackground: dataUrl } } as AppDatabase);
      showToast('✅ تم تحديث صورة الخلفية');
    } catch {
      alert('خطأ في رفع الصورة');
    }
    e.target.value = '';
  };

  const handleGalleryImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const dataUrl = await compressImage(file, 800, 0.75);
      await save({ ...database, gallery: [...(database.gallery ?? []), dataUrl] } as AppDatabase);
    } catch {
      alert('خطأ في رفع الصورة');
    }
    e.target.value = '';
  };

  const removeImgFromField = (idx: number) => {
    const imgs = newImg.split(',').map(s => s.trim()).filter(Boolean);
    imgs.splice(idx, 1);
    setNewImg(imgs.join(','));
  };

  const imgPreviews = newImg ? newImg.split(',').map(s => s.trim()).filter(Boolean) : [];

  const updatePrice = (idx: number, val: string) => {
    const v = Number(val); if (isNaN(v)) return;
    const newDB = { ...database }; const arr = [...products]; arr[idx] = { ...arr[idx], price: v }; newDB[admCat] = arr;
    save(newDB as AppDatabase);
  };

  return (
    <div className="admin-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-panel">
        <h2 style={{ textAlign: 'center', marginBottom: 20, color: 'var(--primary)', borderBottom: '2px solid var(--gold)', paddingBottom: 15 }}>
          لوحة تحكم أصناف oudélle ⚙️ {isCloudActive ? '☁️' : '💾'}
        </h2>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
          <div className="stat-card"><p style={{ fontSize: '.8rem', color: '#666' }}>إجمالي الطلبات</p><div className="stat-val">{stats.totalOrders}</div>
            <button className="admin-btn" style={{ background: '#e74c3c', padding: '3px 10px', fontSize: '.7rem', marginTop: 5 }}
              onClick={() => { if (confirm('تصفير الطلبات؟')) save({ ...database, stats: { ...stats, totalOrders: 0 }, orders: [] } as AppDatabase); }}>تصفير</button>
          </div>
          <div className="stat-card"><p style={{ fontSize: '.8rem', color: '#666' }}>إجمالي المبيعات</p><div className="stat-val">{stats.totalRevenue.toFixed(0)} ج</div>
            <button className="admin-btn" style={{ background: '#ff9800', padding: '3px 10px', fontSize: '.7rem', marginTop: 5 }}
              onClick={() => { if (confirm('تصفير المبيعات؟')) save({ ...database, stats: { ...stats, totalRevenue: 0 } } as AppDatabase); }}>تصفير</button>
          </div>
        </div>

        {/* Ramadan Toggle */}
        <div className="admin-section" style={{ background: '#fff3e0', border: '1px solid #ffe0b2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>🌙 وضع رمضان</h3>
            <button className="admin-btn" style={{ width: 'auto', padding: '5px 20px' }}
              onClick={() => save({ ...database, settings: { ...database.settings, isRamadanMode: !isRamadan } } as AppDatabase)}>
              {isRamadan ? 'إبطال' : 'تفعيل'}
            </button>
          </div>
        </div>

        {/* Add Product */}
        <div className="admin-section">
          <h3>{editIdx >= 0 ? '✏️ تعديل منتج' : 'إضافة منتج جديد'}</h3>
          <div className="admin-form">
            <select className="admin-select" value={newCat} onChange={e => setNewCat(e.target.value)}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="admin-input" placeholder="اسم المنتج" value={newName} onChange={e => setNewName(e.target.value)} />
            <input className="admin-input" type="number" placeholder="السعر" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
            <input className="admin-input" type="number" placeholder="السعر قبل الخصم (اختياري)" value={newOldPrice} onChange={e => setNewOldPrice(e.target.value)} />
            <select className="admin-select" value={newType} onChange={e => setNewType(e.target.value as 'kg' | 'piece')}><option value="kg">بالكيلو</option><option value="piece">بالقطعة</option></select>
            <textarea className="admin-input" style={{ height: 80, resize: 'vertical' }} placeholder="الأطعم (كل طعم في سطر)" value={newOptions} onChange={e => setNewOptions(e.target.value)} />

            {/* Image Upload Section */}
            <div style={{ gridColumn: '1 / -1', border: '2px dashed var(--gold)', borderRadius: 12, padding: 15, background: '#fffbeb' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: 10 }}>📷 صور المنتج</label>
              <input className="admin-input" placeholder="اسم/رابط الصورة (أو ارفع من جهازك)" value={newImg} onChange={e => setNewImg(e.target.value)} style={{ marginBottom: 10 }} />
              <input ref={productImgRef} type="file" accept="image/*" onChange={handleProductImgUpload} style={{ display: 'none' }} />
              <button className="admin-btn" style={{ background: '#f59e0b', width: 'auto', padding: '8px 20px' }} onClick={() => productImgRef.current?.click()}>📤 رفع صورة من الجهاز</button>
              <p style={{ fontSize: '.7rem', color: '#666', marginTop: 5 }}>يتم ضغط الصورة تلقائياً (800px, 70% جودة)</p>

              {/* Image Previews */}
              {imgPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                  {imgPreviews.map((id, idx) => {
                    const src = getImageUrl(id);
                    return (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img src={src} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--gold)' }} />
                        <button onClick={() => removeImgFromField(idx)} style={{ position: 'absolute', top: -6, right: -6, background: 'red', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button className="admin-btn" style={{ background: editIdx >= 0 ? '#2196f3' : 'var(--primary)' }} onClick={addOrEditProduct}>
              {editIdx >= 0 ? 'حفظ التعديلات 💾' : 'إضافة المنتج'}
            </button>
            {editIdx >= 0 && <button className="admin-btn" style={{ background: '#f44336' }} onClick={resetForm}>إلغاء التعديل</button>}
          </div>
        </div>

        {/* Category Management */}
        <div className="admin-section">
          <h3>📂 إدارة الأقسام</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <input className="admin-input" style={{ flex: 2 }} placeholder="اسم القسم الجديد" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
            <input className="admin-input" style={{ flex: 1 }} placeholder="ID (إنجليزي)" value={newCatId} onChange={e => setNewCatId(e.target.value)} />
            <button className="admin-btn" style={{ width: 'auto', padding: '5px 15px' }} onClick={() => {
              const id = newCatId.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (!newCatName || !id) return alert('أكمل البيانات');
              if (categories.find(c => c.id === id)) return alert('ID مستخدم');
              save({ ...database, categories: [...categories, { id, name: newCatName }], [id]: [] } as AppDatabase);
              setNewCatName(''); setNewCatId('');
            }}>إضافة</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {categories.map((c, i) => (
              <div key={c.id} style={{ background: '#e0f2fe', padding: '5px 10px', borderRadius: 15, display: 'flex', gap: 8, alignItems: 'center', fontSize: '.85rem' }}>
                <b>{c.name}</b>
                {!['oriental', 'nabulsia', 'dairy', 'jordanian', 'western', 'offers', 'drinks'].includes(c.id) && (
                  <button onClick={() => {
                    if (!confirm(`حذف "${c.name}"؟`)) return;
                    const newDB = { ...database }; const cats = [...categories]; cats.splice(i, 1); newDB.categories = cats; delete newDB[c.id];
                    save(newDB as AppDatabase);
                  }} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>✖</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Product Table */}
        <div className="admin-tabs">
          {categories.map(c => (
            <button key={c.id} className={`admin-tab ${c.id === admCat ? 'active' : ''}`} onClick={() => setAdmCat(c.id)}>{c.name}</button>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>الاسم</th><th>السعر</th><th>النوع</th><th>الأكثر/VIP/خصم</th><th>الحالة</th><th>إجراءات</th></tr></thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.isMix ? p.title : p.name}</td>
                  <td>{p.isMix ? '---' : <input type="number" value={p.price} style={{ width: 70, padding: 3, border: '1px solid #ddd', borderRadius: 5 }} onChange={e => updatePrice(idx, e.target.value)} />}</td>
                  <td>{p.isMix ? 'مكس' : p.type === 'kg' ? 'كيلو' : 'قطعة'}</td>
                  <td style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="admin-btn" style={{ width: 'auto', padding: '2px 8px', background: p.isBestSeller ? '#ff9800' : '#ccc', fontSize: '.75rem' }} onClick={() => toggleBestSeller(idx)}>🔥</button>
                    <button className="admin-btn" style={{ width: 'auto', padding: '2px 8px', background: p.isVIP ? 'gold' : '#ccc', fontSize: '.75rem' }} onClick={() => toggleVIP(idx)}>👑</button>
                    <button className="admin-btn" style={{ width: 'auto', padding: '2px 8px', background: p.isDiscount ? '#d32f2f' : '#ccc', color: p.isDiscount ? '#fff' : '#000', fontSize: '.75rem' }} onClick={() => toggleDiscount(idx)}>🏷️</button>
                  </td>
                  <td><button className="admin-btn" style={{ width: 'auto', padding: '2px 8px', background: p.inStock !== false ? '#4ade80' : '#ff4444', fontSize: '.75rem' }} onClick={() => toggleStock(idx)}>{p.inStock !== false ? 'متوفر' : 'منتهي'}</button></td>
                  <td style={{ display: 'flex', gap: 3 }}>
                    <button className="admin-btn" style={{ width: 'auto', padding: '2px 8px', background: '#2196f3', fontSize: '.75rem' }} onClick={() => startEdit(idx)}>✏️</button>
                    <button className="admin-btn" style={{ width: 'auto', padding: '2px 8px', background: '#ef4444', fontSize: '.75rem' }} onClick={() => deleteProduct(idx)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Home Background Upload */}
        <div className="admin-section" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
          <h3>🖼️ صورة خلفية الصفحة الرئيسية</h3>
          <input ref={homeBgRef} type="file" accept="image/*" onChange={handleHomeBgUpload} style={{ display: 'none' }} />
          <button className="admin-btn" style={{ background: '#22c55e', width: 'auto', padding: '8px 20px', marginBottom: 10 }} onClick={() => homeBgRef.current?.click()}>📤 رفع صورة جديدة</button>
          {(homeBgPreview || database.settings?.homeBackground) && (
            <div style={{ marginTop: 10 }}>
              <img src={homeBgPreview || database.settings?.homeBackground} alt="" style={{ maxWidth: 250, maxHeight: 150, borderRadius: 10, border: '2px solid var(--gold)' }} />
              <p style={{ fontSize: '.75rem', color: 'green', marginTop: 5 }}>✅ تم تحديث صورة الخلفية ومزامنتها</p>
            </div>
          )}
        </div>

        {/* Gallery Management */}
        <div className="admin-section">
          <h3>📸 إدارة معرض الصور</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <input className="admin-input" style={{ flex: 2 }} placeholder="رابط الصورة (أو ارفع من جهازك)" value={galleryUrl} onChange={e => setGalleryUrl(e.target.value)} />
            <button className="admin-btn" style={{ width: 'auto', padding: '5px 15px' }} onClick={() => {
              if (!galleryUrl) return;
              save({ ...database, gallery: [...(database.gallery ?? []), galleryUrl] } as AppDatabase);
              setGalleryUrl('');
            }}>إضافة رابط</button>
            <input ref={galleryImgRef} type="file" accept="image/*" onChange={handleGalleryImgUpload} style={{ display: 'none' }} />
            <button className="admin-btn" style={{ width: 'auto', padding: '5px 15px', background: '#f59e0b' }} onClick={() => galleryImgRef.current?.click()}>📤 رفع صورة</button>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(database.gallery ?? []).map((url, i) => (
              <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                <img src={url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                <button onClick={() => {
                  const g = [...(database.gallery ?? [])]; g.splice(i, 1);
                  save({ ...database, gallery: g } as AppDatabase);
                }} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 11 }}>×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="admin-section" style={{ marginTop: 20, borderTop: '2px solid var(--gold)', paddingTop: 20 }}>
          <h3>⚙️ الإعدادات العامة</h3>
          <div className="admin-form">
            <input className="admin-input" placeholder="رقم واتساب" value={waNum} onChange={e => setWaNum(e.target.value)} />
            <textarea className="admin-input" style={{ height: 60 }} placeholder="نص الشريط المتحرك" value={tickerText} onChange={e => setTickerText(e.target.value)} />
            <button className="admin-btn" onClick={() => save({ ...database, settings: { ...database.settings, whatsapp: waNum, ticker: tickerText } } as AppDatabase)}>حفظ الإعدادات</button>
          </div>
        </div>

        {/* Vouchers */}
        <div className="admin-section">
          <h3>🏷️ إدارة أكواد الخصم</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <input className="admin-input" style={{ flex: 2 }} placeholder="كود الخصم" value={newVCode} onChange={e => setNewVCode(e.target.value)} />
            <input className="admin-input" type="number" style={{ flex: 1 }} placeholder="%" value={newVPerc} onChange={e => setNewVPerc(e.target.value)} />
            <button className="admin-btn" style={{ width: 'auto', padding: '5px 15px' }} onClick={() => {
              const code = newVCode.toUpperCase(); const perc = Number(newVPerc) / 100;
              if (!code || isNaN(perc)) return; save({ ...database, vouchers: { ...database.vouchers, [code]: perc } } as AppDatabase); setNewVCode(''); setNewVPerc('');
            }}>إضافة</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {Object.entries(database.vouchers ?? {}).map(([code, perc]) => (
              <div key={code} style={{ background: '#e0f2fe', padding: '5px 10px', borderRadius: 15, display: 'flex', gap: 8, alignItems: 'center', fontSize: '.85rem' }}>
                <b>{code}</b> ({(perc as number) * 100}%)
                <button onClick={() => { const v = { ...database.vouchers }; delete v[code]; save({ ...database, vouchers: v } as AppDatabase); }} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>✖</button>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Areas */}
        <div className="admin-section">
          <h3>🚚 إدارة مناطق التوصيل</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <input className="admin-input" style={{ flex: 2 }} placeholder="اسم المنطقة" value={newAreaName} onChange={e => setNewAreaName(e.target.value)} />
            <input className="admin-input" type="number" style={{ flex: 1 }} placeholder="السعر" value={newAreaPrice} onChange={e => setNewAreaPrice(e.target.value)} />
            <button className="admin-btn" style={{ width: 'auto', padding: '5px 15px' }} onClick={() => {
              if (!newAreaName || isNaN(Number(newAreaPrice))) return;
              save({ ...database, delivery: [...(database.delivery ?? []), { name: newAreaName, price: Number(newAreaPrice) }] } as AppDatabase); setNewAreaName(''); setNewAreaPrice('');
            }}>إضافة</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {(database.delivery ?? []).map((a, i) => (
              <div key={i} style={{ background: '#fef3c7', padding: '5px 10px', borderRadius: 15, display: 'flex', gap: 8, alignItems: 'center', fontSize: '.85rem' }}>
                <b>{a.name}</b> ({a.price}ج)
                <button onClick={() => { const d = [...(database.delivery ?? [])]; d.splice(i, 1); save({ ...database, delivery: d } as AppDatabase); }} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>✖</button>
              </div>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="admin-section">
          <h3>📜 سجل الطلبات (آخر 50)</h3>
          <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 8 }}>
            {(database.orders ?? []).map((o, i) => (
              <div key={i} style={{ padding: 10, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><b>#{o.num}</b> — {o.name} <span style={{ fontSize: '.8rem', color: '#666' }}>{o.date}</span></div>
                <span style={{ fontWeight: 700 }}>{o.total?.toFixed?.(2) ?? o.total} ج</span>
              </div>
            ))}
            {(database.orders ?? []).length === 0 && <p style={{ padding: 15, textAlign: 'center', color: '#999' }}>لا توجد طلبات</p>}
          </div>
        </div>

        <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', color: 'red', marginTop: 20, cursor: 'pointer', fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>إغلاق لوحة التحكم</button>
      </div>
    </div>
  );
}
