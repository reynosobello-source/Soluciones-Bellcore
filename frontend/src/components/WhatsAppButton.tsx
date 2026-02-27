import React from 'react';
import { TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, WHATSAPP_NUMBER } from '../constants/theme';

interface WhatsAppButtonProps {
  message?: string;
  style?: any;
}

export default function WhatsAppButton({ message = '', style }: WhatsAppButtonProps) {
  const handlePress = () => {
    const encodedMessage = encodeURIComponent(message || 'Hola, me gustaría obtener más información sobre sus productos.');
    const url = Platform.select({
      ios: `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`,
      android: `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`,
      default: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`,
    });
    
    Linking.openURL(url).catch(() => {
      // Fallback to web version if WhatsApp is not installed
      Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`);
    });
  };

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={handlePress} activeOpacity={0.8}>
      <Ionicons name="logo-whatsapp" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.whatsapp,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
    zIndex: 1000,
  },
});
