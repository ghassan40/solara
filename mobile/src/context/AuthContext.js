// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const token = await AsyncStorage.getItem('zawwid_token');
      if (!token) return setLoading(false);
      const { data } = await api.me();
      setUser(data.user);
    } catch (e) {
      await AsyncStorage.removeItem('zawwid_token');
    } finally {
      setLoading(false);
    }
  }

  async function login(phone, password) {
    const { data } = await api.login(phone, password);
    await AsyncStorage.setItem('zawwid_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function signup(name, phone, password, email) {
    const { data } = await api.signup(name, phone, password, email);
    await AsyncStorage.setItem('zawwid_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await AsyncStorage.removeItem('zawwid_token');
    setUser(null);
  }

  const isStaff = user && ['admin', 'store_manager'].includes(user.role);

  return (
    <AuthContext.Provider value={{ user, loading, isStaff, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
