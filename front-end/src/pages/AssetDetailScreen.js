import { useCallback } from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';

import AppText from '../components/AppText';
import AsyncContent from '../components/AsyncContent';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { colors, spacing } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { getAssetById } from '../services/assetService';
import { formatPrice } from '../utils/format';
import useAsync from '../utils/useAsync';

export default function AssetDetailScreen({ route }) {
  const { id } = route.params;
  const load = useCallback(() => getAssetById(id), [id]);
  const assetState = useAsync(load);
  const { isInCart, addItem, removeItem } = useCart();

  return (
    <Screen>
      <AsyncContent state={assetState}>
        {(asset) => (
          <ScrollView contentContainerStyle={styles.content}>
            {asset.image ? (
              <Image source={asset.image} style={styles.image} resizeMode="contain" accessibilityLabel={asset.title} />
            ) : null}
            <AppText bold size="xl">
              {asset.title}
            </AppText>
            <AppText bold size="xxl" color={colors.primary}>
              {formatPrice(asset.price)}
            </AppText>
            <AppText color={colors.textMuted}>{asset.description}</AppText>
            {isInCart(asset.id) ? (
              <Button
                title="Remover do carrinho"
                variant="outline"
                onPress={() => removeItem(asset.id)}
              />
            ) : (
              <Button title="Adicionar ao carrinho" onPress={() => addItem(asset)} />
            )}
          </ScrollView>
        )}
      </AsyncContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  image: { width: '100%', height: 240, backgroundColor: colors.input },
});
