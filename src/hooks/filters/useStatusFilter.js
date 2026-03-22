import { useState, useMemo } from "react";

export function useStatusFilter(items) {
  const [status, setStatus] = useState('');
  const filtered = useMemo(() => {
    if (!status) return items;
    return items.filter(item => {
      const qty = Number(item.stock_quantity);
      if (status === 'in-stock')      return qty >= 20;
      if (status === 'low')           return qty >= 10 && qty < 20;
      if (status === 'critical')      return qty > 0 && qty < 10;
      if (status === 'out-of-stock')  return qty === 0;
      return true;
    });
  }, [items, status]);

  return { filtered, status, setStatus };
}