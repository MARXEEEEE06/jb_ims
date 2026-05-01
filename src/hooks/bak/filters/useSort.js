import { useState, useMemo } from "react";

const STATUS_ORDER = {
  'OUT OF STOCK': 0,
  'CRITICAL': 1,
  'LOW': 2,
  'IN-STOCK': 3,
};

export function useSort(items) {
  const [sortKey, setSortKey] = useState('');
  const [order, setOrder] = useState('asc');

  const sorted = useMemo(() => {
    const sortedItems = [...items];
    if (!sortKey) return sortedItems;

    sortedItems.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      // Use priority map for status
      if (sortKey === 'status') {
        valA = STATUS_ORDER[valA] ?? 99;
        valB = STATUS_ORDER[valB] ?? 99;
      }

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sortedItems;
  }, [items, sortKey, order]);

  return { sorted, sortKey, setSortKey, order, setOrder };
}