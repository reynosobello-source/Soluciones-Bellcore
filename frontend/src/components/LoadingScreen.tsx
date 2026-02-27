import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, LOGO_URL, COMPANY_NAME } from '../constants/theme';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Cargando...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
      <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: SPACING.lg,
  },
  spinner: {
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
});
