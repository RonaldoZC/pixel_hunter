import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import { EmptyState, ErrorState, LoadingState } from '../components/ListStates';
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

// Lista, edita e exclui os produtos do vendedor logado.
function MyProducts({ navigation }) {
  const { data, loading, error, reload } = useAsync(getMyProducts);
  const [confirmingId, setConfirmingId] = useState(null);
  const remove = useAction(deleteProduct);

  // Ao voltar da edição/cadastro, recarrega a lista (a primeira carga já é feita pelo useAsync).
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

  const confirmDelete = async (id) => {
    if (await remove.run(id)) {
      setConfirmingId(null);
      reload();
    }
  };

  let content;
  if (loading) {
    content = <LoadingState />;
  } else if (error) {
    content = <ErrorState message={error.message} onRetry={reload} />;
  } else if (data.length === 0) {
    content = <EmptyState message="Você ainda não publicou produtos." />;
  } else {
    content = (
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
                  onPress={() => confirmDelete(item.id)}
                />
                <Button
                  title="Cancelar"
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    remove.clear();
                    setConfirmingId(null);
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
    );
  }

  return (
    <Screen>
      {content}
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
