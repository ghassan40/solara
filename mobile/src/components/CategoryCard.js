// components/CategoryCard.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/colors';

export default function CategoryCard({ category, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{category.icon || '🛍️'}</Text>
      <Text style={[styles.label, active && styles.labelActive]}>{category.name_ar}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginEnd: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  icon: { fontSize: 16, marginStart: spacing.xs },
  label: { ...typography.caption, fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  labelActive: { color: '#fff' },
});
