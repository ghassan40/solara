// screens/SignupScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, spacing, radius, typography } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSignup() {
    if (!name || !phone || !password) {
      Alert.alert('تنبيه', 'الاسم ورقم الجوال وكلمة المرور مطلوبين');
      return;
    }
    setSubmitting(true);
    try {
      await signup(name, phone, password, email);
    } catch (err) {
      Alert.alert('خطأ', err.message || 'تعذر إنشاء الحساب');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>إنشاء حساب جديد</Text>

      <Text style={styles.label}>الاسم</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} textAlign="right" />

      <Text style={styles.label}>رقم الجوال</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        textAlign="right"
      />

      <Text style={styles.label}>البريد الإلكتروني (اختياري)</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        textAlign="right"
      />

      <Text style={styles.label}>كلمة المرور</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textAlign="right"
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? '...جاري الإنشاء' : 'إنشاء الحساب'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.md }}>
        <Text style={styles.link}>عندك حساب؟ سجّل الدخول</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.lg, color: colors.textPrimary },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'right' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    ...typography.body,
  },
  button: { backgroundColor: colors.primary, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center' },
  buttonText: { color: '#fff', ...typography.button },
  link: { color: colors.primary, textAlign: 'center', fontWeight: '600' },
});
