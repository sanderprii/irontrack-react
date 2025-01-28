// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Loeme algväärtused localStorage-ist
    const [authState, setAuthState] = useState({
        token: localStorage.getItem('token') || null,
        role: localStorage.getItem('role') || null,
    });

    // Kui token või role muutub, uuendame localStorage-it
    useEffect(() => {
        if (authState.token) {
            localStorage.setItem('token', authState.token);
        } else {
            localStorage.removeItem('token');
        }
        if (authState.role) {
            localStorage.setItem('role', authState.role);
        } else {
            localStorage.removeItem('role');
        }
    }, [authState]);

    // Kasutame mugavaid abistajaid
    const isLoggedIn = !!authState.token;

    // Funktsioonid state uuendamiseks
    const setToken = (token) => {
        setAuthState((prev) => ({ ...prev, token }));
    };

    const setRole = (role) => {
        setAuthState((prev) => ({ ...prev, role }));
    };

    const logout = () => {
        setAuthState({ token: null, role: null });
    };

    return (
        <AuthContext.Provider value={{
            token: authState.token,
            role: authState.role,
            isLoggedIn,
            setToken,
            setRole,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}
