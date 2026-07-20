// App.js - root entry point
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { I18nManager } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

// نفعّل الاتجاه من اليمين لليسار للواجهة العربية
// ملاحظة: في تطبيق حقيقي يحتاج إعادة تشغيل التطبيق بعد أول تفعيل (Expo يطلب Reload)
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
