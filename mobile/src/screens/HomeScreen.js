// screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, typography } from '../theme/colors';
import { api } from '../api/client';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export default function HomeScreen({ navigation }) {
  const { addToCart, refreshCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [activeCategory, search]);

  async function loadInitial() {
    try {
      const { data } = await api.getCategories();
      setCategories(data.categories);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    const { data } = await api.getProducts({
      category: activeCategory || undefined,
      q: search || undefined,
    });
    setProducts(data.products);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadInitial(), loadProducts(), refreshCart()]);
    setRefreshing(false);
  }, []);

  async function handleAdd(product) {
    try {
      await addToCart(product.id, 1);
    } catch (e) {
      // في نسخة إنتاجية: أظهر توست خطأ هنا
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>وش تبي اليوم؟ 👋</Text>
        <TextInput
          style={styles.search}
          placeholder="ابحث عن منتج..."
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
      </View>

      <FlatList
        horizontal
        inverted
        data={categories}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            active={activeCategory === item.id}
            onPress={() => setActiveCategory(activeCategory === item.id ? null : item.id)}
          />
        )}
      />

      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'flex-end' }}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: colors.textSecondary }}>ما فيه منتجات مطابقة</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            onAdd={() => handleAdd(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: spacing.md, paddingBottom: 0 },
  greeting: { ...typography.h2, textAlign: 'right', color: colors.textPrimary, marginBottom: spacing.sm },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
});
