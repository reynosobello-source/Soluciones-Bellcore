import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import LoadingScreen from '../../src/components/LoadingScreen';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Stats {
  total_orders: number;
  pending_orders: number;
  total_quotes: number;
  pending_quotes: number;
  total_users: number;
  total_products: number;
  total_sales: number;
}

export default function AdminScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchStats = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${BACKEND_URL}/api/admin/stats`, { headers });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatPrice = (price: number) => {
    return `RD$ ${price.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  if (user?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed-outline" size={80} color={COLORS.textLight} />
          <Text style={styles.accessDeniedTitle}>Acceso Restringido</Text>
          <Text style={styles.accessDeniedText}>
            Esta sección es solo para administradores
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return <LoadingScreen message="Cargando panel de administración..." />;
  }

  const statCards = [
    {
      icon: 'receipt-outline',
      label: 'Pedidos Totales',
      value: stats?.total_orders || 0,
      color: COLORS.primary,
    },
    {
      icon: 'time-outline',
      label: 'Pedidos Pendientes',
      value: stats?.pending_orders || 0,
      color: COLORS.warning,
    },
    {
      icon: 'document-text-outline',
      label: 'Cotizaciones',
      value: stats?.total_quotes || 0,
      color: COLORS.info,
    },
    {
      icon: 'people-outline',
      label: 'Usuarios',
      value: stats?.total_users || 0,
      color: COLORS.success,
    },
    {
      icon: 'cube-outline',
      label: 'Productos',
      value: stats?.total_products || 0,
      color: COLORS.secondary,
    },
  ];

  const menuItems = [
    {
      icon: 'cube-outline',
      label: 'Gestionar Productos',
      description: 'Agregar, editar o eliminar productos',
      onPress: () => Alert.alert('Próximamente', 'Funcionalidad en desarrollo'),
    },
    {
      icon: 'folder-outline',
      label: 'Gestionar Categorías',
      description: 'Organizar categorías del catálogo',
      onPress: () => Alert.alert('Próximamente', 'Funcionalidad en desarrollo'),
    },
    {
      icon: 'receipt-outline',
      label: 'Ver Pedidos',
      description: 'Administrar estados de pedidos',
      onPress: () => Alert.alert('Próximamente', 'Funcionalidad en desarrollo'),
    },
    {
      icon: 'document-text-outline',
      label: 'Ver Cotizaciones',
      description: 'Responder solicitudes de cotización',
      onPress: () => Alert.alert('Próximamente', 'Funcionalidad en desarrollo'),
    },
    {
      icon: 'people-outline',
      label: 'Gestionar Usuarios',
      description: 'Ver y administrar usuarios',
      onPress: () => Alert.alert('Próximamente', 'Funcionalidad en desarrollo'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Panel de Administración</Text>
          <Text style={styles.headerSubtitle}>Bienvenido, {user?.name?.split(' ')[0]}</Text>
        </View>

        {/* Sales Card */}
        <View style={styles.salesCard}>
          <Ionicons name="trending-up-outline" size={32} color={COLORS.textOnPrimary} />
          <View style={styles.salesInfo}>
            <Text style={styles.salesLabel}>Ventas Totales</Text>
            <Text style={styles.salesValue}>{formatPrice(stats?.total_sales || 0)}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Gestión</Text>
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  salesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  salesInfo: {
    marginLeft: SPACING.md,
  },
  salesLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.accent,
  },
  salesValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    color: COLORS.textOnPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    margin: '1%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  menuSection: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  menuDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  accessDeniedTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  accessDeniedText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  spacer: {
    height: 100,
  },
});
