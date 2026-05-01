import { useState, useMemo } from "react";

export function useKeywordFilter(items, fields = ['product_name', 'sku', 'category', 'brand', 'supplier', 'variant']) {
    const [keyword, setKeyword] = useState("");

    const filtered = useMemo(() => {
        if (!keyword) return items;
        return items.filter(item =>
            fields.some(field =>
                (item[field] || '').toLowerCase().includes(keyword.toLowerCase())
            )
        );
    }, [items, keyword, fields]);

    return { filtered, keyword, setKeyword };
}