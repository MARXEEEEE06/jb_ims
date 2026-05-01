import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import BASE_URL from "./server/config.js";

function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem("token");
                    setUser(null);
                } else {
                    setUser(decoded);
                }
            } catch (err) {
                localStorage.removeItem("token");
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const logout = async () => {
        try {
            await fetch(`${BASE_URL}/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
        } catch (_) {}
        localStorage.removeItem('token');
        setUser(null);
    };

    return { user, logout, loading };
}

export default useAuth;