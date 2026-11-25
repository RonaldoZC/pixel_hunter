import { FlatList, Pressable, StyleSheet } from 'react-native';

import AppText from '../components/AppText';
import AsyncContent from '../components/AsyncContent';
import Card from '../components/Card';
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

function OrdersList({ navigation }) {
  const orders = useAsync(getOrders);

  return (
    <Screen>
      <AsyncContent state={orders} emptyMessage="Você ainda não tem pedidos.">
        {(data) => (
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
        )}
      </AsyncContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.md },
});
