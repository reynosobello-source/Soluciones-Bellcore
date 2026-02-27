import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import LoadingScreen from '../../src/components/LoadingScreen';
import WhatsAppButton from '../../src/components/WhatsAppButton';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Order {
  order_id: string;
  items: any[];
  subtotal: number;
  itbis: number;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const STATUS_LABELS: { [key: string]: { label: string; color: string } } = {
  pending: { label: 'Pendiente', color: COLORS.warning },
  processing: { label: 'En Proceso', color: COLORS.info },
  shipped: { label: 'Enviado', color: COLORS.primary },
  delivered: { label: 'Entregado', color: COLORS.success },
  cancelled: { label: 'Cancelado', color: COLORS.error },
};

export default function OrdersScreen() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'quotes'>('orders');

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    try {
      const headers = await getAuthHeaders();
      const [ordersRes, quotesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/orders`, { headers }),
        axios.get(`${BACKEND_URL}/api/quotes`, { headers }),
      ]);
      setOrders(ordersRes.data);
      setQuotes(quotesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const formatPrice = (price: number) => {
    return `RD$ ${price.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const statusInfo = STATUS_LABELS[item.status] || STATUS_LABELS.pending;
    
    return (
      <TouchableOpacity style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Pedido #{item.order_id.slice(-8).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>
        
        <View style={styles.orderBody}>
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
          <Text style={styles.orderItems}>{item.items.length} producto(s)</Text>
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>{formatPrice(item.total)}</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuote = ({ item }: { item: any }) => {
    const statusColors: { [key: string]: string } = {
      pending: COLORS.warning,
      responded: COLORS.success,
      closed: COLORS.textLight,
    };
    const statusLabels: { [key: string]: string } = {
      pending: 'Pendiente',
      responded: 'Respondida',
      closed: 'Cerrada',
    };
    
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Cotización #{item.quote_id.slice(-8).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: (statusColors[item.status] || COLORS.warning) + '20' }]}>
            <Text style={[styles.statusText, { color: statusColors[item.status] || COLORS.warning }]}>
              {statusLabels[item.status] || 'Pendiente'}
            </Text>
          </View>
        </View>
        
        <View style={styles.orderBody}>
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
          <Text style={styles.orderItems}>{item.items.length} producto(s)</Text>
        </View>
        
        {item.response && (
          <View style={styles.quoteResponse}>
            <Text style={styles.quoteResponseLabel}>Respuesta:</Text>
            <Text style={styles.quoteResponseText}>{item.response}</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return <LoadingScreen message="Cargando historial..." />;
  }

  const currentData = activeTab === 'orders' ? orders : quotes;
  const isEmpty = currentData.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons
            name="receipt-outline"
            size={20}
            color={activeTab === 'orders' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
            Pedidos ({orders.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'quotes' && styles.tabActive]}
          onPress={() => setActiveTab('quotes')}
        >
          <Ionicons
            name="document-text-outline"
            size={20}
            color={activeTab === 'quotes' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'quotes' && styles.tabTextActive]}>
            Cotizaciones ({quotes.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Ionicons
            name={activeTab === 'orders' ? 'receipt-outline' : 'document-text-outline'}
            size={80}
            color={COLORS.textLight}
          />
          <Text style={styles.emptyTitle}>
            {activeTab === 'orders' ? 'Sin pedidos' : 'Sin cotizaciones'}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === 'orders'
              ? 'Aún no has realizado ningún pedido'
              : 'Aún no has solicitado ninguna cotización'}
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/catalog')}
          >
            <Text style={styles.shopButtonText}>Explorar Catálogo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={currentData}
          renderItem={activeTab === 'orders' ? renderOrder : renderQuote}
          keyExtractor={(item) => activeTab === 'orders' ? item.order_id : item.quote_id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <WhatsAppButton />
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
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 120,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderId: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  orderDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  orderItems: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  orderTotal: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quoteResponse: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  quoteResponseLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  quoteResponseText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
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
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  shopButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
});
