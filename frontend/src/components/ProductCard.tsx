import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  featured: boolean;
}

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
}

export default function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return `RD$ ${price.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        {product.images && product.images.length > 0 ? (
          <Image
            source={{ uri: product.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color={COLORS.textLight} />
          </View>
        )}
        {product.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Destacado</Text>
          </View>
        )}
        {product.stock <= 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Agotado</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        
        {onAddToCart && product.stock > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
          >
            <Ionicons name="cart-outline" size={18} color={COLORS.textOnPrimary} />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
    margin: SPACING.xs,
    flex: 1,
    maxWidth: '48%',
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: COLORS.surfaceSecondary,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  featuredText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  content: {
    padding: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    minHeight: 40,
  },
  price: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  addButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
});
