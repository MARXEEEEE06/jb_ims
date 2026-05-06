import { useState, useMemo } from "react";

export function useBrandFilter(items, allItems) {
  const [brand, setBrand] = useState('');
  
  const brands = useMemo(() => 
    [...new Set(
      allItems
        .filter(item => item.brand_status !== 'inactive')  // same here
        .map(item => item.brand)
        .filter(Boolean)
    )].sort()
  , [allItems]);

  const filtered = useMemo(() => 
    brand 
      ? items.filter(item => item.brand === brand)
      : items.filter(item => item.brand_status !== 'inactive')  // adjust field name to match what your API returns
  , [items, brand]);

  return { filtered, brand, setBrand, brands };
}