import { useState, useMemo } from "react";

export function useSupplierFilter(items, allItems) {
  const [supplier, setSupplier] = useState('');

  const suppliers = useMemo(() => 
    [...new Set(allItems.map(item => item.supplier).filter(Boolean))].sort()
  , [allItems]);

  const filtered = useMemo(() => 
    supplier ? items.filter(item => item.supplier === supplier) : items
  , [items, supplier]);

  return { filtered, supplier, setSupplier, suppliers };
}