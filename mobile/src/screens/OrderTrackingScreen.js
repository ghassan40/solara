// screens/OrderTrackingScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/colors';
import { api } from '../api/client';

const STEPS = [
  { key: 'pending', label: 'تم استلام الطلب', icon: '📝' },
  { key: 'confirmed', label: 'تم تأكيد الطلب', icon: '✅' },
  { key: 'preparing', label: 'يتم تجهيز طلبك', icon: '📦' },
  { key: 'out_for_delivery', label: 'الطلب في الطريق إليك', icon: '🛵' },
  { key: 'delivered', label: 'تم التوصيل بنجاح', icon: '🎉' },
];

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    const { data } = await api.getOrder(orderId);
    setOrder(data.order);
    setItems(data.items);
  }, [orderId]);

  useEffect(() => {
    load();
    // نتحقق من حالة الطلب كل 10 ثواني لمحاكاة التتبع اللحظي
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.orderNumber}>طلب #{order.id.slice(0, 8)}</Text>

      {isCancelled ? (
        <View style={styles.cancelledBox}>
          <Text style={styles.cancelledText}>تم إلغاء هذا الطلب ❌</Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {STEPS.map((step, idx) => {
            const done = idx <= currentIndex;
            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepIndicatorCol}>
                  <View style={[styles.dot, done && styles.dotDone]}>
                    <Text>{step.icon}</Text>
                  </View>
                  {idx < STEPS.length - 1 && (
                    <View style={[styles.line, done && styles.lineDone]} />
                  )}
                </View>
                <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{step.label}</Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.itemsBox}>
        <Text style={styles.sectionTitle}>تفاصيل الطلب</Text>
        {items.map((it) => (
          <View key={it.id} style={styles.itemRow}>
            <Text style={styles.itemQty}>×{it.quantity}</Text>
            <Text style={styles.itemName}>{it.product_name}</Text>
            <Text style={styles.itemPrice}>{(it.unit_price * it.quantity).toFixed(2)} ر.س</Text>
          </View>
        ))}
        <View style={[styles.itemRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.xs }]}>
          <Text style={styles.totalLabel}>الإجمالي</Text>
          <Text style={styles.totalValue}>{order.total.toFixed(2)} ر.س</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('HomeTab')}>
        <Text style={styles.homeBtnText}>الرجوع للرئيسية</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orderNumber: { ...typography.h2, textAlign: 'center', marginBottom: spacing.lg, color: colors.textPrimary },
  cancelledBox: { backgroundColor: '#FDEBEB', borderRadius: radius.md, padding: spacing.lg, alignItems: 'center' },
  cancelledText: { color: colors.danger, fontWeight: '700', fontSize: 16 },
  timeline: { marginBottom: spacing.lg },
  stepRow: { flexDirection: 'row-reverse', alignItems: 'flex-start' },
  stepIndicatorCol: { alignItems: 'center', marginStart: spacing.md },
  dot: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.primaryLight, borderWidth: 2, borderColor: colors.primary },
  line: { width: 2, flex: 1, minHeight: 24, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.primary },
  stepLabel: { ...typography.body, color: colors.textSecondary, textAlign: 'right', flex: 1, paddingTop: spacing.xs, paddingBottom: spacing.md },
  stepLabelDone: { color: colors.textPrimary, fontWeight: '700' },
  itemsBox: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { ...typography.h2, fontSize: 16, textAlign: 'right', marginBottom: spacing.sm },
  itemRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: spacing.xs },
  itemQty: { color: colors.textSecondary, width: 30 },
  itemName: { flex: 1, textAlign: 'right', color: colors.textPrimary },
  itemPrice: { color: colors.textPrimary, fontWeight: '600' },
  totalLabel: { fontWeight: '700', color: colors.textPrimary },
  totalValue: { fontWeight: '700', color: colors.primary },
  homeBtn: { marginTop: spacing.lg, alignItems: 'center', padding: spacing.md },
  homeBtnText: { color: colors.primary, fontWeight: '700' },
});
