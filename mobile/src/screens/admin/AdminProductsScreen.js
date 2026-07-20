// screens/admin/AdminProductsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme/colors';
import { api } from '../../api/client';

export default function AdminProductsScreen() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name_ar: '', price: '', unit: 'قطعة', stock_qty: '', category_id: '' });

  const load = useCallback(async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      api.getProducts({ limit: 100 }),
      api.getCategories(),
    ]);
    setProducts(p.products);
    setCategories(c.categories);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ name_ar: '', price: '', unit: 'قطعة', stock_qty: '', category_id: categories[0]?.id || '' });
    setModalVisible(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name_ar: product.name_ar,
      price: String(product.price),
      unit: product.unit,
      stock_qty: String(product.stock_qty),
      category_id: product.category_id || '',
    });
    setModalVisible(true);
  }

  async function handleSave() {
    if (!form.name_ar || !form.price) {
      Alert.alert('تنبيه', 'اسم المنتج والسعر مطلوبين');
      return;
    }
    const payload = {
      name_ar: form.name_ar,
      price: parseFloat(form.price),
      unit: form.unit,
      stock_qty: parseInt(form.stock_qty) || 0,
      category_id: form.category_id || null,
    };
    try {
      if (editing) {
        await api.updateProduct(editing.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setModalVisible(false);
      load();
    } catch (err) {
      Alert.alert('خطأ', err.message || 'تعذر الحفظ');
    }
  }

  function handleDelete(product) {
    Alert.alert('حذف المنتج', `تبي تحذف "${product.name_ar}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          await api.deleteProduct(product.id);
          load();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
        <Text style={styles.addBtnText}>+ إضافة منتج جديد</Text>
      </TouchableOpacity>

      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowBody}>
              <Text style={styles.name}>{item.name_ar}</Text>
              <Text style={styles.meta}>
                {item.price.toFixed(2)} ر.س · {item.unit} · مخزون: {item.stock_qty}
              </Text>
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                <Text>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
                <Text>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>{editing ? 'تعديل المنتج' : 'منتج جديد'}</Text>

              <Text style={styles.label}>اسم المنتج</Text>
              <TextInput
                style={styles.input}
                value={form.name_ar}
                onChangeText={(t) => setForm({ ...form, name_ar: t })}
                textAlign="right"
              />

              <Text style={styles.label}>السعر (ر.س)</Text>
              <TextInput
                style={styles.input}
                value={form.price}
                onChangeText={(t) => setForm({ ...form, price: t })}
                keyboardType="decimal-pad"
                textAlign="right"
              />

              <Text style={styles.label}>الوحدة</Text>
              <TextInput
                style={styles.input}
                value={form.unit}
                onChangeText={(t) => setForm({ ...form, unit: t })}
                textAlign="right"
              />

              <Text style={styles.label}>الكمية بالمخزون</Text>
              <TextInput
                style={styles.input}
                value={form.stock_qty}
                onChangeText={(t) => setForm({ ...form, stock_qty: t })}
                keyboardType="number-pad"
                textAlign="right"
              />

              <Text style={styles.label}>القسم</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.catChip, form.category_id === c.id && styles.catChipActive]}
                    onPress={() => setForm({ ...form, category_id: c.id })}
                  >
                    <Text style={form.category_id === c.id ? styles.catChipTextActive : styles.catChipText}>
                      {c.name_ar}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>حفظ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelModalBtnText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  addBtn: { backgroundColor: colors.primary, margin: spacing.md, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  row: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  rowBody: { flex: 1, alignItems: 'flex-end' },
  name: { fontWeight: '700', color: colors.textPrimary },
  meta: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  rowActions: { flexDirection: 'row-reverse', gap: spacing.sm },
  iconBtn: { padding: spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, maxHeight: '85%' },
  modalTitle: { ...typography.h2, textAlign: 'right', marginBottom: spacing.md, color: colors.textPrimary },
  label: { ...typography.caption, color: colors.textSecondary, textAlign: 'right', marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.md, ...typography.body },
  catChip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, marginEnd: spacing.sm },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { color: colors.textPrimary, fontSize: 13 },
  catChipTextActive: { color: '#fff', fontSize: 13 },
  modalActions: { flexDirection: 'row-reverse', gap: spacing.sm, marginTop: spacing.sm },
  saveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  cancelModalBtn: { flex: 1, backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  cancelModalBtnText: { color: colors.textPrimary, fontWeight: '700' },
});
