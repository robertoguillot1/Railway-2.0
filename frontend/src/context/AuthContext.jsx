// src/context/AuthContext.jsx
// Gestión global del estado de autenticación con JWT

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../api/hydroApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('hydro_token'));
  const [loading, setLoading] = useState(true);

  // Verificar token al cargar la app
  useEffect(() => {
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async (tkn) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/core/me/`, {
        headers: { Authorization: `Bearer ${tkn}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${BASE_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Credenciales incorrectas');
    }
    const data = await res.json();
    localStorage.setItem('hydro_token', data.access);
    localStorage.setItem('hydro_refresh', data.refresh);
    setToken(data.access);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hydro_token');
    localStorage.removeItem('hydro_refresh');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.is_admin === true;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
