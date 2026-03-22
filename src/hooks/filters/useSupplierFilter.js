import { useState, useMemo } from "react";

export function useSupplierFilter(items) {
  const [supplier, setSupplier] = useState('');
  const filtered = useMemo(() => {
    return supplier ? items.filter(item => item.supplier.toLowerCase().includes(supplier.toLowerCase())) : items;
  }, [items, supplier]);

  return { filtered, supplier, setSupplier };
}