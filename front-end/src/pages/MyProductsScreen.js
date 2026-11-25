import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import AsyncContent from '../components/AsyncContent';
import Button from '../components/Button';
import Card from '../components/Card';
import RequireAuth from '../components/RequireAuth';
import Screen from '../components/Screen';
import { colors, spacing } from '../constants/theme';
import { deleteProduct, getMyProducts } from '../services/productService';
import { formatPrice } from '../utils/format';
import useAction from '../utils/useAction';
import useAsync from '../utils/useAsync';

export default function MyProductsScreen({ navigation }) {
  return (
    <RequireAuth role="SELLER" message="Só contas de vendedor têm produtos publicados.">
      <MyProducts navigation={navigation} />
    </RequireAuth>
  );
}

function MyProducts({ navigation }) {
  const products = useAsync(getMyProducts);
  const { reload } = products;
  const [confirmingId, setConfirmingId] = useState();
  const remove = useAction(async (id) => {
    await deleteProduct(id);
    setConfirmingId(undefined);
    reload();
  });

  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      reload();
    }, [reload])
  );

  return (
    <Screen>
      <AsyncContent state={products} emptyMessage="Você ainda não publicou produtos.">
        {(data) => (
          <FlatList
            data={data}
            keyExtractor={(asset) => asset.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              remove.error ? (
                <AppText size="sm" color={colors.error}>
                  {remove.error}
                </AppText>
              ) : null
            }
            renderItem={({ item }) => (
              <Card>
                <View style={styles.row}>
                  {item.image ? <Image source={item.image} style={styles.thumb} resizeMode="cover" /> : null}
                  <View style={styles.info}>
                    <AppText bold numberOfLines={2}>
                      {item.title}
                    </AppText>
                    <AppText bold color={colors.primary}>
                      {formatPrice(item.price)}
                    </AppText>
                  </View>
                </View>
                {confirmingId === item.id ? (
                  <View style={styles.actions}>
                    <Button
                      title="Confirmar exclusão"
                      size="sm"
                      loading={remove.loading}
                      onPress={() => remove.run(item.id)}
                    />
                    <Button
                      title="Cancelar"
                      variant="outline"
                      size="sm"
                      onPress={() => {
                        remove.clear();
                        setConfirmingId(undefined);
                      }}
                    />
                  </View>
                ) : (
                  <View style={styles.actions}>
                    <Button
                      title="Editar"
                      variant="outline"
                      size="sm"
                      onPress={() => navigation.navigate('ProductCreate', { product: item })}
                    />
                    <Button
                      title="Excluir"
                      variant="outline"
                      size="sm"
                      onPress={() => {
                        remove.clear();
                        setConfirmingId(item.id);
                      }}
                    />
                  </View>
                )}
              </Card>
            )}
          />
        )}
      </AsyncContent>
      <View style={styles.footer}>
        <Button title="Novo produto" onPress={() => navigation.navigate('ProductCreate')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  thumb: { width: 72, height: 72, backgroundColor: colors.input },
  info: { flex: 1, gap: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.md },
  footer: { padding: spacing.md },
});
