import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS, LOGO_URL, COMPANY_NAME } from '../src/constants/theme';
import LoadingScreen from '../src/components/LoadingScreen';

export default function LoginScreen() {
  const { login, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Verificando sesión..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Bienvenido a</Text>
          <Text style={styles.brandName}>{COMPANY_NAME}</Text>
          <Text style={styles.subtitle}>
            Tu tienda de suministros de oficina, tecnología y más
          </Text>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Compra en línea</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Solicita cotizaciones</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="logo-whatsapp" size={24} color={COLORS.whatsapp} />
              <Text style={styles.featureText}>Contacto directo</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={login} activeOpacity={0.8}>
            <Image
              source={{ uri: 'https://www.google.com/favicon.ico' }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logo: {
    width: 150,
    height: 150,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
  brandName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  featureItem: {
    alignItems: 'center',
    width: 100,
  },
  featureText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
    width: '100%',
    maxWidth: 320,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: SPACING.md,
  },
  googleButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  termsText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
});
