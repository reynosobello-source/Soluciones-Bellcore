import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS, WHATSAPP_NUMBER } from '../src/constants/theme';
import { useCartStore } from '../src/stores/cartStore';
import { useAuth } from '../src/contexts/AuthContext';
import * as Linking from 'expo-linking';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function QuoteScreen() {
  const { user } = useAuth();
  const { cart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [observations, setObservations] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleSubmitQuote = async () => {
    if (!cart?.items || cart.items.length === 0) {
      Alert.alert('Error', 'No hay productos para cotizar');
      return;
    }

    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const items = cart.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      await axios.post(
        `${BACKEND_URL}/api/quotes`,
        {
          items,
          observations: observations || undefined,
          phone: phone || undefined,
        },
        { headers }
      );

      Alert.alert(
        'Cotización Enviada',
        'Tu solicitud de cotización ha sido enviada. BELLPOINT te contactará pronto.',
        [
          {
            text: 'Ver Cotizaciones',
            onPress: () => router.replace('/(tabs)/orders'),
          },
          {
            text: 'Contactar por WhatsApp',
            onPress: handleWhatsApp,
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la cotización');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = () => {
    let message = 'Hola, acabo de enviar una solicitud de cotización para los siguientes productos:\n\n';
    cart?.items.forEach((item) => {
      message += `- ${item.name} (Cantidad: ${item.quantity})\n`;
    });
    if (observations) {
      message += `\nObservaciones: ${observations}`;
    }
    
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  if (!cart?.items || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={80} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No hay productos</Text>
          <Text style={styles.emptyText}>Agrega productos al carrito para solicitar una cotización</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Solicitar Cotización</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={24} color={COLORS.info} />
            <Text style={styles.infoText}>
              Envía esta lista a BELLPOINT para recibir una cotización personalizada con precios especiales.
            </Text>
          </View>

          {/* Products List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos a Cotizar ({cart.items.length})</Text>
            
            {cart.items.map((item) => (
              <View key={item.product_id} style={styles.productItem}>
                <View style={styles.productImageContainer}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                  ) : (
                    <View style={styles.productImagePlaceholder}>
                      <Ionicons name="image-outline" size={20} color={COLORS.textLight} />
                    </View>
                  )}
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.productQuantity}>Cantidad: {item.quantity}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>
            
            <View style={styles.contactCard}>
              <View style={styles.contactRow}>
                <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.contactText}>{user?.name}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.contactText}>{user?.email}</Text>
              </View>
              
              <Text style={styles.inputLabel}>Teléfono de contacto</Text>
              <TextInput
                style={styles.input}
                placeholder="Teléfono para contactarte"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          {/* Observations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            <TextInput
              style={styles.observationsInput}
              placeholder="Especifica requerimientos especiales, cantidades específicas, plazos de entrega, etc."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              value={observations}
              onChangeText={setObservations}
            />
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={24} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.buttonDisabled]}
            onPress={handleSubmitQuote}
            disabled={isLoading}
          >
            <Ionicons name="send" size={20} color={COLORS.textOnPrimary} />
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Enviando...' : 'Enviar Cotización'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '20',
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.info,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceSecondary,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productDetails: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  productName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  productQuantity: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  contactCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  contactText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  observationsInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: 'top',
    ...SHADOWS.small,
  },
  spacer: {
    height: 120,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.md,
    ...SHADOWS.large,
  },
  whatsappButton: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.whatsapp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  backButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  backButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
});
