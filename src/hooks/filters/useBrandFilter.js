import { useState, useMemo } from "react";

export function useBrandFilter(items, allItems) {
  const [brand, setBrand] = useState('');
  
  const brands = useMemo(() => 
    [...new Set(allItems.map(item => item.brand).filter(Boolean))].sort()
  , [allItems]);

  const filtered = useMemo(() => 
    brand ? items.filter(item => item.brand === brand) : items
  , [items, brand]);

  return { filtered, brand, setBrand, brands };
}