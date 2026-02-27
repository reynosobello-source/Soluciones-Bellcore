import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';
import { useCartStore } from '../src/stores/cartStore';
import { useAuth } from '../src/contexts/AuthContext';
import LoadingScreen from '../src/components/LoadingScreen';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function CheckoutScreen() {
  const { user, refreshUser } = useAuth();
  const { cart, fetchCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [notes, setNotes] = useState('');
  
  // New address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    province: '',
    phone: '',
  });

  useEffect(() => {
    fetchCart();
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a: any) => a.is_default) || user.addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, []);

  const formatPrice = (price: number) => {
    return `RD$ ${price.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.province || !newAddress.phone) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        `${BACKEND_URL}/api/users/addresses`,
        { ...newAddress, is_default: !user?.addresses?.length },
        { headers }
      );
      
      await refreshUser();
      setShowAddressForm(false);
      setNewAddress({ name: '', street: '', city: '', province: '', phone: '' });
      
      // Select the new address
      const addresses = response.data.addresses;
      if (addresses?.length > 0) {
        setSelectedAddress(addresses[addresses.length - 1]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la dirección');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Por favor selecciona o agrega una dirección de envío');
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      Alert.alert('Error', 'Tu carrito está vacío');
      return;
    }

    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      await axios.post(
        `${BACKEND_URL}/api/orders`,
        {
          shipping_address: selectedAddress,
          payment_method: paymentMethod,
          notes: notes || undefined,
        },
        { headers }
      );

      Alert.alert(
        '¡Pedido Realizado!',
        'Tu pedido ha sido procesado exitosamente. Recibirás una confirmación pronto.',
        [
          {
            text: 'Ver Pedidos',
            onPress: () => {
              router.replace('/(tabs)/orders');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart?.items || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={80} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Carrito vacío</Text>
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
          <Text style={styles.headerTitle}>Finalizar Compra</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dirección de Envío</Text>
            
            {user?.addresses?.map((address: any) => (
              <TouchableOpacity
                key={address.address_id}
                style={[
                  styles.addressCard,
                  selectedAddress?.address_id === address.address_id && styles.addressCardSelected,
                ]}
                onPress={() => setSelectedAddress(address)}
              >
                <View style={styles.radioButton}>
                  {selectedAddress?.address_id === address.address_id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <View style={styles.addressContent}>
                  <Text style={styles.addressName}>{address.name}</Text>
                  <Text style={styles.addressText}>{address.street}</Text>
                  <Text style={styles.addressText}>{address.city}, {address.province}</Text>
                  <Text style={styles.addressPhone}>{address.phone}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {showAddressForm ? (
              <View style={styles.addressForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de la dirección (ej: Casa, Oficina)"
                  placeholderTextColor={COLORS.textLight}
                  value={newAddress.name}
                  onChangeText={(text) => setNewAddress({ ...newAddress, name: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Dirección completa"
                  placeholderTextColor={COLORS.textLight}
                  value={newAddress.street}
                  onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ciudad"
                  placeholderTextColor={COLORS.textLight}
                  value={newAddress.city}
                  onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Provincia"
                  placeholderTextColor={COLORS.textLight}
                  value={newAddress.province}
                  onChangeText={(text) => setNewAddress({ ...newAddress, province: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Teléfono"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="phone-pad"
                  value={newAddress.phone}
                  onChangeText={(text) => setNewAddress({ ...newAddress, phone: text })}
                />
                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowAddressForm(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress}>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => setShowAddressForm(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.addAddressText}>Agregar nueva dirección</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Método de Pago</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'card' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <View style={styles.radioButton}>
                {paymentMethod === 'card' && <View style={styles.radioButtonInner} />}
              </View>
              <Ionicons name="card-outline" size={24} color={COLORS.text} />
              <Text style={styles.paymentText}>Tarjeta de Crédito/Débito</Text>
              <Text style={styles.mockBadge}>SIMULADO</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'transfer' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('transfer')}
            >
              <View style={styles.radioButton}>
                {paymentMethod === 'transfer' && <View style={styles.radioButtonInner} />}
              </View>
              <Ionicons name="swap-horizontal-outline" size={24} color={COLORS.text} />
              <Text style={styles.paymentText}>Transferencia Bancaria</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'cash' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <View style={styles.radioButton}>
                {paymentMethod === 'cash' && <View style={styles.radioButtonInner} />}
              </View>
              <Ionicons name="cash-outline" size={24} color={COLORS.text} />
              <Text style={styles.paymentText}>Pago contra entrega</Text>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas (Opcional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Instrucciones especiales para el pedido..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen del Pedido</Text>
            <View style={styles.summaryCard}>
              {cart.items.map((item) => (
                <View key={item.product_id} style={styles.summaryItem}>
                  <Text style={styles.summaryItemName} numberOfLines={1}>
                    {item.quantity}x {item.name}
                  </Text>
                  <Text style={styles.summaryItemPrice}>
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatPrice(cart.subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ITBIS (18%)</Text>
                <Text style={styles.summaryValue}>{formatPrice(cart.itbis)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(cart.total)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Place Order Button */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.placeOrderButton, isLoading && styles.buttonDisabled]}
            onPress={handlePlaceOrder}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.placeOrderText}>Procesando...</Text>
            ) : (
              <>
                <Text style={styles.placeOrderText}>Realizar Pedido</Text>
                <Text style={styles.placeOrderPrice}>{formatPrice(cart.total)}</Text>
              </>
            )}
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
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  addressCardSelected: {
    borderColor: COLORS.primary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  addressContent: {
    flex: 1,
  },
  addressName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  addressText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addressPhone: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    gap: SPACING.sm,
  },
  addAddressText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  addressForm: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  input: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  formButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textOnPrimary,
    fontWeight: '600',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: SPACING.md,
    ...SHADOWS.small,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
  },
  paymentText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  mockBadge: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.warning,
    fontWeight: 'bold',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
    ...SHADOWS.small,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryItemName: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
  },
  summaryItemPrice: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  totalLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  spacer: {
    height: 120,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.large,
  },
  placeOrderButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
  },
  placeOrderPrice: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
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
