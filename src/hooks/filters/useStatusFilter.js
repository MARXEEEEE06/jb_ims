// import { useState, useMemo } from "react";

// export function useStatusFilter(items) {
//   const [status, setStatus] = useState('');
//   const filtered = useMemo(() => {
//     if (!status) return items;
//     return items.filter(item => {
//       const qty = Number(item.quantity);
//       if (status === 'in-stock')      return qty >= 20;
//       if (status === 'low')           return qty >= 10 && qty < 20;
//       if (status === 'critical')      return qty > 0 && qty < 10;
//       if (status === 'out-of-stock')  return qty === 0;
//       return true;
//     });
//   }, [items, status]);

//   return { filtered, status, setStatus };
// }

import { useState, useMemo } from "react";

export function useStatusFilter(items, field = 'status') {
    const [status, setStatus] = useState('');
    const filtered = useMemo(() => {
        if (!status) return items;
        return items.filter(item => {
            // inventory quantity-based filtering
            if (field === 'quantity') {
                const qty = Number(item.quantity);
                if (status === 'in-stock')     return qty >= 20;
                if (status === 'low')          return qty >= 10 && qty < 20;
                if (status === 'critical')     return qty > 0 && qty < 10;
                if (status === 'out-of-stock') return qty === 0;
                return true;
            }
            // string-based filtering for brands/suppliers
            return item[field]?.toLowerCase() === status.toLowerCase();
        });
    }, [items, status, field]);

    return { filtered, status, setStatus };
}