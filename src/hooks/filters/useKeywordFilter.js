import { useState, useMemo } from "react";

export function useKeywordFilter(items, fields = ['prod_name', 'SKU', 'category', 'brand', 'supplier', 'variety']) {
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