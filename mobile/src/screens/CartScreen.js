// screens/CartScreen.js
import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/colors';
import { useCart } from '../context/CartContext';

const DELIVERY_FEE = 7;

export default function CartScreen({ navigation }) {
  const { items, subtotal, updateQuantity, removeItem, refreshCart } = useCart();

  useEffect(() => {
    refreshCart();
  }, []);

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 50, marginBottom: spacing.md }}>🛒</Text>
        <Text style={styles.emptyText}>سلتك فاضية</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('HomeTab')}>
          <Text style={styles.shopBtnText}>ابدأ التسوق</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                <Text>🛒</Text>
              </View>
            )}
            <View style={styles.rowBody}>
              <Text style={styles.name}>{item.name_ar}</Text>
              <Text style={styles.unit}>{item.unit}</Text>
              <Text style={styles.price}>{(item.price * item.quantity).toFixed(2)} ر.س</Text>
            </View>
            <View style={styles.qtyControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() =>
                  item.quantity > 1
                    ? updateQuantity(item.id, item.quantity - 1)
                    : removeItem(item.id)
                }
              >
                <Text style={styles.qtyBtnText}>{item.quantity > 1 ? '-' : '🗑'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>المجموع الفرعي</Text>
          <Text style={styles.summaryValue}>{subtotal.toFixed(2)} ر.س</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>رسوم التوصيل</Text>
          <Text style={styles.summaryValue}>{DELIVERY_FEE.toFixed(2)} ر.س</Text>
        </View>
        <View style={[styles.summaryRow, { marginTop: spacing.xs }]}>
          <Text style={styles.totalLabel}>الإجمالي</Text>
          <Text style={styles.totalValue}>{(subtotal + DELIVERY_FEE).toFixed(2)} ر.س</Text>
        </View>

        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.checkoutBtnText}>إتمام الطلب</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  emptyText: { ...typography.h2, color: colors.textSecondary, marginBottom: spacing.lg },
  shopBtn: { backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.pill },
  shopBtnText: { color: '#fff', fontWeight: '700' },
  row: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  thumb: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.primaryLight },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, marginEnd: spacing.sm, alignItems: 'flex-end' },
  name: { ...typography.body, fontWeight: '600', textAlign: 'right' },
  unit: { ...typography.caption, color: colors.textSecondary },
  price: { ...typography.body, color: colors.primary, fontWeight: '700', marginTop: 2 },
  qtyControls: { alignItems: 'center' },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  qtyBtnText: { color: colors.primary, fontWeight: '700' },
  qtyValue: { fontWeight: '700', marginVertical: 2 },
  summary: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
  summaryRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { color: colors.textSecondary },
  summaryValue: { color: colors.textPrimary, fontWeight: '600' },
  totalLabel: { ...typography.h2, color: colors.textPrimary },
  totalValue: { ...typography.h2, color: colors.primary },
  checkoutBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  checkoutBtnText: { color: '#fff', ...typography.button },
});
