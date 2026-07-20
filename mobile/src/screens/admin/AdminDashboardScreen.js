// screens/admin/AdminDashboardScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, typography } from '../../theme/colors';
import { api } from '../../api/client';

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.getAdminStats();
    setStats(data);
  }, []);

  useEffect(() => {
    load();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (!stats) return <View style={styles.container} />;

  const cards = [
    { label: 'الطلبات النشطة', value: stats.pendingOrders, icon: '⏳' },
    { label: 'إجمالي الطلبات', value: stats.totalOrders, icon: '📦' },
    { label: 'المبيعات (المسلّمة)', value: `${stats.totalRevenue.toFixed(0)} ر.س`, icon: '💰' },
    { label: 'العملاء', value: stats.totalCustomers, icon: '👥' },
    { label: 'المنتجات النشطة', value: stats.totalProducts, icon: '🛒' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.md }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>لوحة تحكم المتجر</Text>

      <View style={styles.grid}>
        {cards.map((c) => (
          <View key={c.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{c.icon}</Text>
            <Text style={styles.statValue}>{c.value}</Text>
            <Text style={styles.statLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AdminOrders')}>
          <Text style={styles.actionText}>إدارة الطلبات</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AdminProducts')}>
          <Text style={styles.actionText}>إدارة المنتجات</Text>
        </TouchableOpacity>
      </View>

      {stats.lowStock.length > 0 && (
        <View style={styles.lowStockBox}>
          <Text style={styles.sectionTitle}>⚠️ منتجات على وشك النفاد</Text>
          {stats.lowStock.map((p) => (
            <View key={p.id} style={styles.lowStockRow}>
              <Text style={styles.lowStockQty}>{p.stock_qty} متبقي</Text>
              <Text style={styles.lowStockName}>{p.name_ar}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { ...typography.h1, fontSize: 22, textAlign: 'right', marginBottom: spacing.md, color: colors.textPrimary },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-end',
  },
  statIcon: { fontSize: 20, marginBottom: spacing.xs },
  statValue: { ...typography.h2, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  actionsRow: { flexDirection: 'row-reverse', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '700' },
  lowStockBox: { backgroundColor: '#FFF7E8', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg },
  sectionTitle: { fontWeight: '700', textAlign: 'right', marginBottom: spacing.sm, color: colors.textPrimary },
  lowStockRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: spacing.xs },
  lowStockName: { color: colors.textPrimary },
  lowStockQty: { color: colors.danger, fontWeight: '700' },
});
