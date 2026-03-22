import { useState, useMemo } from "react";

export function useBrandFilter(items) {
  const [brand, setBrand] = useState('');
  const filtered = useMemo(() => {
    return brand ? items.filter(item => item.brand.toLowerCase().includes(brand.toLowerCase())) : items;
  }, [items, brand]);

  return { filtered, brand, setBrand };
}