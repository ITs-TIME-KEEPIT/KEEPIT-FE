
import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface RadioInputFieldProps {
  label?: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export default function RadioInputField({
  label = '라벨',
  selected = false,
  onPress,
  disabled = false,
}: RadioInputFieldProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{
        checked: selected,
        disabled,
      }}
      style={styles.container}
    >
      <View
        style={[
          styles.radio,
          selected && styles.radioSelected,
        ]}
      >
        {selected && <View style={styles.innerCircle} />}
      </View>

      <Text style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 21,
  },

  radio: {
    width: 20,
    height: 20,

    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  innerCircle: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.white,
    borderRadius: 999,
  },

  label: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },
});
