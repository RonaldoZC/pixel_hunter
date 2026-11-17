import { FlatList, StyleSheet } from 'react-native';

import AppText from '../components/AppText';
import Card from '../components/Card';
import { EmptyState, ErrorState, LoadingState } from '../components/ListStates';
import RequireAuth from '../components/RequireAuth';
import Screen from '../components/Screen';
import { colors, spacing } from '../constants/theme';
import { getSales } from '../services/saleService';
import { formatDateTime, formatPrice } from '../utils/format';
import useAsync from '../utils/useAsync';

export default function SalesScreen() {
  return (
    <RequireAuth role="SELLER" message="Só contas de vendedor têm histórico de vendas.">
      <SalesList />
    </RequireAuth>
  );
}

// Histórico de vendas do vendedor logado, com o total vendido no topo.
function SalesList() {
  const { data, loading, error, reload } = useAsync(getSales);

  let content;
  if (loading) {
    content = <LoadingState />;
  } else if (error) {
    content = <ErrorState message={error.message} onRetry={reload} />;
  } else if (data.length === 0) {
    content = <EmptyState message="Você ainda não vendeu nenhum produto." />;
  } else {
    const total = data.reduce((sum, sale) => sum + sale.price, 0);
    content = (
      <FlatList
        data={data}
        keyExtractor={(sale) => sale.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <AppText bold size="lg" color={colors.primary}>
            Total vendido: {formatPrice(total)} ({data.length} {data.length === 1 ? 'venda' : 'vendas'})
          </AppText>
        }
        renderItem={({ item }) => (
          <Card>
            <AppText bold numberOfLines={2}>
              {item.title}
            </AppText>
            <AppText size="sm" color={colors.textMuted}>
              Pedido {item.orderNumber} · {formatDateTime(item.soldAt)}
            </AppText>
            <AppText bold color={colors.primary}>
              {formatPrice(item.price)}
            </AppText>
          </Card>
        )}
      />
    );
  }

  return <Screen>{content}</Screen>;
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.md },
});
