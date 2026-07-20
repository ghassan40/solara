// api/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// غيّر هذا الرابط لعنوان السيرفر الفعلي وقت النشر
// أثناء التطوير على المحاكي: Android يستخدم 10.0.2.2 بدل localhost
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:4000/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('zawwid_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || 'صار خطأ، حاول مرة ثانية';
    return Promise.reject({ ...err, message });
  }
);

export default client;

// ---- API helper functions ----

export const api = {
  // auth
  login: (phone, password) => client.post('/auth/login', { phone, password }),
  signup: (name, phone, password, email) =>
    client.post('/auth/signup', { name, phone, password, email }),
  me: () => client.get('/auth/me'),

  // catalog
  getCategories: () => client.get('/categories'),
  getProducts: (params) => client.get('/products', { params }),
  getProduct: (id) => client.get(`/products/${id}`),

  // cart
  getCart: () => client.get('/cart'),
  addToCart: (product_id, quantity = 1) => client.post('/cart/items', { product_id, quantity }),
  updateCartItem: (itemId, quantity) => client.put(`/cart/items/${itemId}`, { quantity }),
  removeCartItem: (itemId) => client.delete(`/cart/items/${itemId}`),
  clearCart: () => client.delete('/cart'),

  // orders
  checkout: (payload) => client.post('/orders', payload),
  getOrders: () => client.get('/orders'),
  getOrder: (id) => client.get(`/orders/${id}`),

  // admin
  getAdminStats: () => client.get('/admin/stats'),
  getAllOrders: (status) => client.get('/orders/admin/all', { params: { status } }),
  updateOrderStatus: (id, status) => client.put(`/orders/${id}/status`, { status }),
  createProduct: (payload) => client.post('/products', payload),
  updateProduct: (id, payload) => client.put(`/products/${id}`, payload),
  deleteProduct: (id) => client.delete(`/products/${id}`),
};
