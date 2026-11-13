import { FlatList, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import { EmptyState } from '../components/ListStates';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { colors, spacing } from '../constants/theme';
import { createOrder } from '../services/orderService';
import { formatPrice } from '../utils/format';
import useAction from '../utils/useAction';

export default function CartScreen({ navigation }) {
  const { items, total, removeItem, clear } = useCart();
  const { user, isBuyer } = useAuth();
  const checkout = useAction(async () => {
    await createOrder(items);
    clear();
    navigation.replace('Orders');
  });

  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState message="Seu carrinho está vazio." />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <AppText bold numberOfLines={2}>
                {item.title}
              </AppText>
              <AppText bold color={colors.primary}>
                {formatPrice(item.price)}
              </AppText>
            </View>
            <Button title="Remover" variant="outline" size="sm" onPress={() => removeItem(item.id)} />
          </View>
        )}
      />
      <View style={styles.footer}>
        <AppText bold size="lg">
          Total: {formatPrice(total)}
        </AppText>
        {isBuyer ? (
          <Button title="Finalizar compra" onPress={checkout.run} loading={checkout.loading} />
        ) : (
          <>
            <Button title="Finalizar compra" disabled />
            <AppText size="sm" color={colors.textMuted} style={styles.note}>
              {user
                ? 'Só contas de comprador podem finalizar compras.'
                : 'Entre com uma conta de comprador para finalizar a compra.'}
            </AppText>
            {user ? null : (
              <Button title="Entrar" variant="outline" size="sm" onPress={() => navigation.navigate('Home')} />
            )}
          </>
        )}
        {checkout.error ? (
          <AppText size="sm" color={colors.error} style={styles.note}>
            {checkout.error}
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  info: { flex: 1, gap: spacing.xs },
  footer: {
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  note: { textAlign: 'center' },
});
