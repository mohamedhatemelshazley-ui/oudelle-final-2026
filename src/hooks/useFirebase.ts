import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_DATABASE } from '../data';
import type { AppDatabase, Product } from '../types';

const STORAGE_KEY = 'oudelle_custom_database';

function mergeDefaults(data: Partial<AppDatabase>): AppDatabase {
  return {
    ...DEFAULT_DATABASE,
    ...data,
    categories: data.categories ?? DEFAULT_DATABASE.categories,
    settings: { ...DEFAULT_DATABASE.settings, ...(data.settings ?? {}) },
    stats: { ...DEFAULT_DATABASE.stats, ...(data.stats ?? {}) },
    vouchers: data.vouchers ?? DEFAULT_DATABASE.vouchers,
    delivery: data.delivery ?? DEFAULT_DATABASE.delivery,
    gallery: data.gallery ?? DEFAULT_DATABASE.gallery,
    orders: data.orders ?? DEFAULT_DATABASE.orders,
    updates: data.updates ?? DEFAULT_DATABASE.updates,
    uploadedImages: data.uploadedImages ?? DEFAULT_DATABASE.uploadedImages,
  };
}

export function useFirebaseDB() {
  const [database, setDatabase] = useState<AppDatabase>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return mergeDefaults(JSON.parse(stored));
    } catch { /* ignore */ }
    return { ...DEFAULT_DATABASE };
  });
  const [isCloudActive, setIsCloudActive] = useState(false);

  // Listen to Firestore for real-time updates
  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'app', 'data'), (snap) => {
        if (snap.exists()) {
          const cloudData = mergeDefaults(snap.data() as Partial<AppDatabase>);
          setDatabase(cloudData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
          setIsCloudActive(true);
        }
      }, () => {
        setIsCloudActive(false);
      });
      return unsub;
    } catch (err) {
      console.error("Firestore subscription error:", err);
    }
  }, []);

  const saveDatabase = useCallback(async (newDB: AppDatabase) => {
    setDatabase(newDB);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDB));
    try {
      await setDoc(doc(db, 'app', 'data'), newDB as Record<string, unknown>);
      setIsCloudActive(true);
    } catch {
      setIsCloudActive(false);
    }
  }, []);

  const getProducts = useCallback((categoryId: string): Product[] => {
    return (database[categoryId] as Product[] | undefined) ?? [];
  }, [database]);

  const getImageUrl = useCallback((img: string): string => {
    if (!img) return '';
    if (img.startsWith('data:') || img.startsWith('http')) return img;
    const uploaded = database.uploadedImages?.[img];
    if (uploaded) return uploaded;
    return `/images/${img}`;
  }, [database]);

  return { database, saveDatabase, getProducts, getImageUrl, isCloudActive };
}
