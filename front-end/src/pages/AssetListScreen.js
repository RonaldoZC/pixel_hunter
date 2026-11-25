import { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import AssetCard from '../components/AssetCard';
import AsyncContent from '../components/AsyncContent';
import BackgroundImage from '../components/BackgroundImage';
import Screen from '../components/Screen';
import { mapBackground, mapBackgroundSize } from '../constants/images';
import { spacing } from '../constants/theme';
import { getAssets } from '../services/assetService';
import useAsync from '../utils/useAsync';

export default function AssetListScreen({ route, navigation }) {
  const { categoryId, query } = route.params;
  const load = useCallback(() => getAssets({ categoryId, query }), [categoryId, query]);
  const assets = useAsync(load);

  return (
    <Screen>
      <BackgroundImage source={mapBackground} imageSize={mapBackgroundSize} dim={0.55} />
      <AsyncContent state={assets} emptyMessage="Nenhum asset encontrado.">
        {(data) => (
          <FlatList
            data={data}
            keyExtractor={(asset) => asset.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <AssetCard
                title={item.title}
                price={item.price}
                image={item.image}
                onPress={() => navigation.navigate('AssetDetail', { id: item.id })}
              />
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
