import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // ✅ was missing

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

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return { user, logout, loading };
}

export default useAuth;