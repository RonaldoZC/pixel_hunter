import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import AppText from '../components/AppText';
import Card from '../components/Card';
import { EmptyState, ErrorState, LoadingState } from '../components/ListStates';
import RequireAuth from '../components/RequireAuth';
import Screen from '../components/Screen';
import { orderStatusLabel } from '../constants/orders';
import { colors, spacing } from '../constants/theme';
import { getOrders } from '../services/orderService';
import { formatDateTime, formatPrice } from '../utils/format';
import useAsync from '../utils/useAsync';

export default function OrdersScreen({ navigation }) {
  return (
    <RequireAuth role="BUYER" message="Só contas de comprador têm pedidos.">
      <OrdersList navigation={navigation} />
    </RequireAuth>
  );
}

// Histórico de compras do usuário logado.
function OrdersList({ navigation }) {
  const load = useCallback(() => getOrders(), []);
  const { data, loading, error, reload } = useAsync(load);

  let content;
  if (loading) {
    content = <LoadingState />;
  } else if (error) {
    content = <ErrorState message={error.message} onRetry={reload} />;
  } else if (data.length === 0) {
    content = <EmptyState message="Você ainda não tem pedidos." />;
  } else {
    content = (
      <FlatList
        data={data}
        keyExtractor={(order) => order.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
          >
            <Card>
              <AppText bold>
                Pedido {item.number} · {orderStatusLabel(item.status)}
              </AppText>
              <AppText size="sm" color={colors.textMuted}>
                {formatDateTime(item.createdAt)}
              </AppText>
              {item.items.map((line) => (
                <AppText key={line.assetId} size="sm" numberOfLines={1}>
                  {line.title} — {formatPrice(line.price)}
                </AppText>
              ))}
              <AppText bold color={colors.primary}>
                Total: {formatPrice(item.total)}
              </AppText>
            </Card>
          </Pressable>
        )}
      />
    );
  }

  return <Screen>{content}</Screen>;
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.md },
});
