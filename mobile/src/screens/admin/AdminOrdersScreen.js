// screens/admin/AdminOrdersScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, radius, typography } from '../../theme/colors';
import { api } from '../../api/client';

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
const STATUS_LABELS = {
  pending: 'قيد التأكيد',
  confirmed: 'تم التأكيد',
  preparing: 'يتم التجهيز',
  out_for_delivery: 'خرج للتوصيل',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState(null);

  const load = useCallback(async () => {
    const { data } = await api.getAllOrders(filter || undefined);
    setOrders(data.orders);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function advanceStatus(order) {
    const idx = STATUS_FLOW.indexOf(order.status);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;
    await api.updateOrderStatus(order.id, next);
    load();
  }

  async function cancelOrder(order) {
    await api.updateOrderStatus(order.id, 'cancelled');
    load();
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        inverted
      >
        {[null, ...STATUS_FLOW, 'cancelled'].map((s) => (
          <TouchableOpacity
            key={s || 'all'}
            style={[styles.filterChip, filter === s && styles.filterChipActive]}
            onPress={() => setFilter(s)}
          >
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
              {s ? STATUS_LABELS[s] : 'الكل'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
              <Text style={styles.status}>{STATUS_LABELS[item.status]}</Text>
            </View>
            <Text style={styles.total}>{item.total.toFixed(2)} ر.س</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString('ar-SA')}</Text>

            {!['delivered', 'cancelled'].includes(item.status) && (
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.advanceBtn} onPress={() => advanceStatus(item)}>
                  <Text style={styles.advanceBtnText}>
                    التالي: {STATUS_LABELS[STATUS_FLOW[STATUS_FLOW.indexOf(item.status) + 1]]}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelOrder(item)}>
                  <Text style={styles.cancelBtnText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginEnd: spacing.sm,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  orderId: { color: colors.textSecondary },
  status: { fontWeight: '700', color: colors.primary },
  total: { ...typography.h2, fontSize: 16, textAlign: 'right', marginTop: spacing.xs, color: colors.textPrimary },
  date: { ...typography.caption, textAlign: 'right', color: colors.textSecondary },
  actionsRow: { flexDirection: 'row-reverse', gap: spacing.sm, marginTop: spacing.sm },
  advanceBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.sm, padding: spacing.sm, alignItems: 'center' },
  advanceBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cancelBtn: { backgroundColor: '#FDEBEB', borderRadius: radius.sm, padding: spacing.sm, alignItems: 'center', paddingHorizontal: spacing.md },
  cancelBtnText: { color: colors.danger, fontWeight: '700', fontSize: 13 },
});
