// screens/ProductDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/colors';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.getProduct(productId).then(({ data }) => setProduct(data.product));
  }, [productId]);

  async function handleAdd() {
    setAdding(true);
    try {
      await addToCart(productId, qty);
      Alert.alert('تمت الإضافة', 'انضاف المنتج للسلة', [
        { text: 'متابعة التسوق', style: 'cancel' },
        { text: 'اذهب للسلة', onPress: () => navigation.navigate('Cart') },
      ]);
    } catch (e) {
      Alert.alert('خطأ', e.message || 'تعذرت الإضافة للسلة');
    } finally {
      setAdding(false);
    }
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={{ fontSize: 60 }}>🛒</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.name}>{product.name_ar}</Text>
        <Text style={styles.unit}>{product.unit}</Text>
        <Text style={styles.price}>{product.price.toFixed(2)} ر.س</Text>

        {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => q + 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{qty}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={adding}>
        <Text style={styles.addButtonText}>
          {adding ? '...جاري الإضافة' : `أضف للسلة - ${(product.price * qty).toFixed(2)} ر.س`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 260, backgroundColor: colors.primaryLight },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg },
  name: { ...typography.h1, fontSize: 22, textAlign: 'right', color: colors.textPrimary },
  unit: { ...typography.body, textAlign: 'right', color: colors.textSecondary, marginTop: spacing.xs },
  price: { ...typography.h1, fontSize: 24, textAlign: 'right', color: colors.primary, marginTop: spacing.sm },
  description: { ...typography.body, textAlign: 'right', color: colors.textSecondary, marginTop: spacing.md, lineHeight: 22 },
  qtyRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 22, color: colors.primary, fontWeight: '700' },
  qtyValue: { ...typography.h2, minWidth: 30, textAlign: 'center' },
  addButton: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', ...typography.button },
});
