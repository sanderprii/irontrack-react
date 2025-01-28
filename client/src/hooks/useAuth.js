// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

export default function useAuth() {
    const [auth, setAuth] = useState({
        loading: true,
        isLoggedIn: false,
        userRole: null,
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        setAuth({
            loading: false,
            isLoggedIn: !!token,
            userRole: role,
        });
    }, []);

    return auth; // { loading, isLoggedIn, userRole }
}
