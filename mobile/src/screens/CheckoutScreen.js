// screens/CheckoutScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/colors';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';

const DELIVERY_FEE = 7;

export default function CheckoutScreen({ navigation }) {
  const { subtotal, clearCart } = useCart();
  const [payment, setPayment] = useState('cod');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);

  async function handlePlaceOrder() {
    setPlacing(true);
    try {
      const { data } = await api.checkout({ payment_method: payment, notes });
      await clearCart();
      navigation.replace('OrderTracking', { orderId: data.order.id });
    } catch (err) {
      Alert.alert('خطأ', err.message || 'تعذر إتمام الطلب');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.sectionTitle}>طريقة الدفع</Text>
      <TouchableOpacity
        style={[styles.option, payment === 'cod' && styles.optionActive]}
        onPress={() => setPayment('cod')}
      >
        <Text style={styles.optionText}>الدفع عند الاستلام 💵</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, payment === 'card' && styles.optionActive]}
        onPress={() => setPayment('card')}
      >
        <Text style={styles.optionText}>بطاقة ائتمانية 💳</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>ملاحظات للسائق (اختياري)</Text>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="مثال: اتصل عند الوصول"
        textAlign="right"
        multiline
      />

      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>المجموع الفرعي</Text>
          <Text style={styles.summaryValue}>{subtotal.toFixed(2)} ر.س</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>رسوم التوصيل</Text>
          <Text style={styles.summaryValue}>{DELIVERY_FEE.toFixed(2)} ر.س</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>الإجمالي</Text>
          <Text style={styles.totalValue}>{(subtotal + DELIVERY_FEE).toFixed(2)} ر.س</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.placeBtn} onPress={handlePlaceOrder} disabled={placing}>
        <Text style={styles.placeBtnText}>{placing ? '...جاري تأكيد الطلب' : 'تأكيد الطلب'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  sectionTitle: { ...typography.h2, fontSize: 16, textAlign: 'right', marginBottom: spacing.sm, marginTop: spacing.md, color: colors.textPrimary },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionText: { textAlign: 'right', ...typography.body, fontWeight: '600' },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    minHeight: 70,
    ...typography.body,
  },
  summaryBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { color: colors.textSecondary },
  summaryValue: { color: colors.textPrimary, fontWeight: '600' },
  totalLabel: { ...typography.h2, fontSize: 16, color: colors.textPrimary },
  totalValue: { ...typography.h2, fontSize: 16, color: colors.primary },
  placeBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
  placeBtnText: { color: '#fff', ...typography.button },
});
