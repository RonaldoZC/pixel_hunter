import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { coverRect } from '../utils/imageLayout';

export default function BackgroundImage({ source, imageSize, blur = 0, dim = 0 }) {
  const [container, setContainer] = useState();

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={({ nativeEvent }) => setContainer(nativeEvent.layout)}
    >
      {container ? (
        <Image
          source={source}
          style={[styles.image, coverRect({ container, image: imageSize })]}
          resizeMode="stretch"
          blurRadius={blur}
          accessible={false}
        />
      ) : null}
      {dim > 0 ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0, 0, 0, ${dim})` }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { position: 'absolute' },
});
