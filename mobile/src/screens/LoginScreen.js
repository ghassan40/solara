// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors, spacing, radius, typography } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!phone || !password) {
      Alert.alert('تنبيه', 'ادخل رقم الجوال وكلمة المرور');
      return;
    }
    setSubmitting(true);
    try {
      await login(phone, password);
    } catch (err) {
      Alert.alert('خطأ', err.message || 'تعذر تسجيل الدخول');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.logo}>زوّد</Text>
      <Text style={styles.subtitle}>كل احتياجاتك، توصيلها سريع</Text>

      <View style={styles.form}>
        <Text style={styles.label}>رقم الجوال</Text>
        <TextInput
          style={styles.input}
          placeholder="05xxxxxxxx"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          textAlign="right"
        />

        <Text style={styles.label}>كلمة المرور</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textAlign="right"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={submitting}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>{submitting ? '...جاري الدخول' : 'تسجيل الدخول'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{ marginTop: spacing.md }}>
          <Text style={styles.link}>ما عندك حساب؟ سجّل الآن</Text>
        </TouchableOpacity>

        <View style={styles.hintBox}>
          <Text style={styles.hintText}>للتجربة: 0511111111 / 123456</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, justifyContent: 'center', padding: spacing.lg },
  logo: { ...typography.h1, fontSize: 40, color: '#fff', textAlign: 'center' },
  subtitle: { ...typography.body, color: '#fff', textAlign: 'center', marginBottom: spacing.xl, opacity: 0.9 },
  form: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'right' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...typography.body,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buttonText: { color: '#fff', ...typography.button },
  link: { color: colors.primary, textAlign: 'center', fontWeight: '600' },
  hintBox: { marginTop: spacing.lg, padding: spacing.sm, backgroundColor: colors.primaryLight, borderRadius: radius.sm },
  hintText: { ...typography.caption, color: colors.primaryDark, textAlign: 'center' },
});
