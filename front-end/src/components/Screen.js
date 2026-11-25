import { StyleSheet, View } from 'react-native';

import { colors } from '../constants/theme';

export default function Screen({ style, children }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
