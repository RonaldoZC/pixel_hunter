import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../constants/theme';
import AppText from './AppText';

export default function OptionPicker({ label, options, value, onChange, error }) {
  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText size="sm" color={colors.textMuted}>
          {label}
        </AppText>
      ) : null}
      <View style={styles.options}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[styles.option, selected && styles.selected, error && !selected && styles.optionError]}
            >
              <AppText bold={selected} size="sm" color={selected ? colors.textOnPrimary : colors.primary}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <AppText size="sm" color={colors.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.primary },
  optionError: { borderColor: colors.error },
});
