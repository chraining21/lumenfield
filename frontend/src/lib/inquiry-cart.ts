"use client";

import { useSyncExternalStore } from "react";

// 詢價清單存在瀏覽器 localStorage（不需登入）；只存產品 slug 與數量，
// 型號、名稱等快照在送出時才寫入詢價單（見 docs/DATA_MODEL.md）
export type CartItem = { slug: string; qty: number };

const KEY = "lf-inquiry";
const EVENT = "lf-inquiry-change";
const EMPTY: CartItem[] = [];

let cacheRaw: string | null = null;
let cacheItems: CartItem[] = EMPTY;

function read(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      cacheItems = Array.isArray(parsed) ? parsed : EMPTY;
    } catch {
      cacheItems = EMPTY;
    }
  }
  return cacheItems;
}

function write(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  addEventListener(EVENT, onChange);
  addEventListener("storage", onChange); // 其他分頁改動時同步
  return () => {
    removeEventListener(EVENT, onChange);
    removeEventListener("storage", onChange);
  };
}

export function useInquiryCart(): CartItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function addToCart(slug: string, qty = 1) {
  const items = read();
  const found = items.find((i) => i.slug === slug);
  write(found ? items.map((i) => (i === found ? { ...i, qty: i.qty + qty } : i)) : [...items, { slug, qty }]);
}

export function setCartQty(slug: string, qty: number) {
  write(read().map((i) => (i.slug === slug ? { ...i, qty: Math.max(1, qty) } : i)));
}

export function removeFromCart(slug: string) {
  write(read().filter((i) => i.slug !== slug));
}

export function clearCart() {
  write([]);
}
