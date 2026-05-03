import { useState, useCallback } from "react";

export function useToast() {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, duration = 3000) => {
        setToast({ message, duration, key: Date.now() });
    }, []);

    const clearToast = useCallback(() => setToast(null), []);

    return { toast, showToast, clearToast };
}