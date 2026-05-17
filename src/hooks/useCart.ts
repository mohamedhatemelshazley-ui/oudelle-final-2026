import { useState, useCallback, useEffect } from 'react';
import type { CartItem } from '../types';

const CART_KEY = 'oudelle_cart';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch { /* ignore */ }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addPiece = useCallback((name: string, price: number, quantity: number, option?: string) => {
    const itemName = option ? `${name} (${option})` : name;
    setCart(prev => [...prev, {
      name: itemName,
      price: price * quantity,
      quantity,
      type: 'piece' as const,
      unitPrice: price,
    }]);
  }, []);

  const addKg = useCallback((name: string, pricePerKg: number, weight: number, option?: string) => {
    const labels: Record<number, string> = { 0.25: 'ربع كيلو', 0.5: 'نصف كيلو', 0.75: 'كيلو إلا ربع', 1: 'كيلو' };
    const label = labels[weight] ?? `${weight} كيلو`;
    const itemName = `${name} (${label})${option ? ` - ${option}` : ''}`;
    setCart(prev => [...prev, {
      name: itemName,
      price: pricePerKg * weight,
      quantity: 1,
      weight,
      type: 'kg' as const,
      unitPrice: pricePerKg,
    }]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

  return { cart, addPiece, addKg, removeItem, clearCart, subtotal, count: cart.length };
}
