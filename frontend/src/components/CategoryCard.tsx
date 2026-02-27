import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface Category {
  category_id: string;
  name: string;
  description?: string;
  image?: string;
}

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export default function CategoryCard({ category, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        {category.image ? (
          <Image source={{ uri: category.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <Ionicons name="folder-outline" size={32} color={COLORS.primary} />
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>{category.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
    margin: SPACING.xs,
    width: 100,
    height: 100,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
});
