// components/ProductCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/colors';

export default function ProductCard({ product, onPress, onAdd }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ fontSize: 28 }}>🛒</Text>
          </View>
        )}
      </View>
      <Text numberOfLines={2} style={styles.name}>
        {product.name_ar}
      </Text>
      <Text style={styles.unit}>{product.unit}</Text>
      <View style={styles.footer}>
        <Text style={styles.price}>{product.price.toFixed(2)} ر.س</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAdd} hitSlop={8}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginEnd: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageWrap: { marginBottom: spacing.xs },
  image: { width: '100%', height: 90, borderRadius: radius.sm, backgroundColor: colors.primaryLight },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  name: { ...typography.body, color: colors.textPrimary, minHeight: 38 },
  unit: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  footer: {
    marginTop: spacing.xs,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: -2 },
});
