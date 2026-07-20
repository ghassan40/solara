// screens/OrdersScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/colors';
import { api } from '../api/client';

const STATUS_LABELS = {
  pending: 'قيد التأكيد',
  confirmed: 'تم التأكيد',
  preparing: 'يتم التجهيز',
  out_for_delivery: 'خرج للتوصيل',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const STATUS_COLORS = {
  pending: colors.warning,
  confirmed: colors.primary,
  preparing: colors.primary,
  out_for_delivery: colors.accent,
  delivered: colors.success,
  cancelled: colors.danger,
};

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.getOrders();
    setOrders(data.orders);
  }, []);

  useEffect(() => {
    load();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (orders.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 50, marginBottom: spacing.md }}>📦</Text>
        <Text style={styles.emptyText}>ما عندك طلبات بعد</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ padding: spacing.md }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.status, { color: STATUS_COLORS[item.status] }]}>
              {STATUS_LABELS[item.status]}
            </Text>
            <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.total}>{item.total.toFixed(2)} ر.س</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('ar-SA')}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.h2, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: spacing.xs },
  status: { fontWeight: '700' },
  orderId: { color: colors.textSecondary },
  cardFooter: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  total: { fontWeight: '700', color: colors.textPrimary },
  date: { color: colors.textSecondary },
});
