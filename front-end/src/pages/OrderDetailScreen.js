import { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import AppText from '../components/AppText';
import Card from '../components/Card';
import { ErrorState, LoadingState } from '../components/ListStates';
import RequireAuth from '../components/RequireAuth';
import Screen from '../components/Screen';
import { orderStatusLabel } from '../constants/orders';
import { colors, spacing } from '../constants/theme';
import { getOrderById } from '../services/orderService';
import { formatDateTime, formatPrice } from '../utils/format';
import useAsync from '../utils/useAsync';

export default function OrderDetailScreen({ route }) {
  return (
    <RequireAuth role="BUYER" message="Só contas de comprador têm pedidos.">
      <OrderDetail id={route.params.id} />
    </RequireAuth>
  );
}

function OrderDetail({ id }) {
  const load = useCallback(() => getOrderById(id), [id]);
  const { data: order, loading, error, reload } = useAsync(load);

  if (loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen>
        <ErrorState message={error.message} onRetry={reload} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText bold size="xl">
          Pedido {order.number}
        </AppText>
        <AppText color={colors.textMuted}>
          {orderStatusLabel(order.status)} · {formatDateTime(order.createdAt)}
        </AppText>
        <Card>
          {order.items.map((item) => (
            <AppText key={item.assetId}>
              {item.title} — {formatPrice(item.price)}
            </AppText>
          ))}
        </Card>
        <AppText bold size="lg" color={colors.primary}>
          Total: {formatPrice(order.total)}
        </AppText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
});
