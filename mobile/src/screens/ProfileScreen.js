// screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, isStaff } = useAuth();

  function handleLogout() {
    Alert.alert('تسجيل الخروج', 'هل تبي تسجل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={{ fontSize: 32 }}>👤</Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.phone}>{user?.phone}</Text>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.menuText}>طلباتي 📦</Text>
        </TouchableOpacity>

        {isStaff && (
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AdminDashboard')}>
            <Text style={styles.menuText}>لوحة تحكم المتجر 🛠️</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Text style={[styles.menuText, styles.logoutText]}>تسجيل الخروج 🚪</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', padding: spacing.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  name: { ...typography.h2, marginTop: spacing.md, color: colors.textPrimary },
  phone: { ...typography.body, color: colors.textSecondary },
  menu: { width: '100%', marginTop: spacing.xl },
  menuItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuText: { textAlign: 'right', ...typography.body, fontWeight: '600', color: colors.textPrimary },
  logoutItem: { backgroundColor: '#FDEBEB', borderColor: '#F5C6C6' },
  logoutText: { color: colors.danger },
});
