// ─── Product Types ───────────────────────────────────────────────────────────
export interface Product {
  name: string;
  price: number;
  oldPrice?: number | null;
  type: 'kg' | 'piece';
  img: string;
  images?: string[];
  options?: string[] | null;
  inStock?: boolean;
  isBestSeller?: boolean;
  isVIP?: boolean;
  isDiscount?: boolean;
  isMix?: boolean;
  title?: string;
  source?: string;
  contents?: string[];
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
}

// ─── Cart Item ───────────────────────────────────────────────────────────────
export interface CartItem {
  name: string;
  price: number;
  quantity: number;
  type: 'piece' | 'kg' | 'mix';
  unitPrice?: number;
  weight?: number;
  isMix?: boolean;
}

// ─── Delivery Area ───────────────────────────────────────────────────────────
export interface DeliveryArea {
  name: string;
  price: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export interface Order {
  num: number;
  name: string;
  phone: string;
  addr: string;
  meth: 'delivery' | 'pickup' | 'dinein';
  table?: number | null;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  date: string;
  scheduled?: { date: string; time: string };
}

// ─── Update/News ─────────────────────────────────────────────────────────────
export interface UpdateItem {
  text: string;
  img: string;
  date: string;
  timestamp: number;
}

// ─── Settings ────────────────────────────────────────────────────────────────
export interface AppSettings {
  whatsapp: string;
  ticker: string;
  isRamadanMode?: boolean;
  homeBackground?: string;
}

// ─── Stats ───────────────────────────────────────────────────────────────────
export interface AppStats {
  totalOrders: number;
  totalRevenue: number;
}

// ─── Full Database ───────────────────────────────────────────────────────────
export interface AppDatabase {
  categories: Category[];
  settings: AppSettings;
  stats: AppStats;
  vouchers: Record<string, number>;
  delivery: DeliveryArea[];
  gallery: string[];
  orders: Order[];
  updates: UpdateItem[];
  uploadedImages: Record<string, string>;
  [key: string]: unknown; // dynamic category keys
}

// ─── Delivery Method ─────────────────────────────────────────────────────────
export type DeliveryMethod = 'delivery' | 'pickup' | 'dinein';

// ─── View ────────────────────────────────────────────────────────────────────
export type AppView = 'home' | 'menu';
