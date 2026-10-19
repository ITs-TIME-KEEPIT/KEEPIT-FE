
import React from 'react';
import {
  Pressable,
  View,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface ToggleInputFieldProps {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export default function ToggleInputField({
  value = false,
  onValueChange,
  disabled = false,
  accessibilityLabel = '설정 전환',
}: ToggleInputFieldProps) {
  return (
    <Pressable
      onPress={() => onValueChange?.(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{
        checked: value,
        disabled,
      }}
      style={[
        styles.toggle,
        value && styles.toggleOn,
      ]}
    >
      <View
        style={[
          styles.thumb,
          value && styles.thumbOn,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 999,

    paddingHorizontal: 2,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.border,
  },

  toggleOn: {
    backgroundColor: COLORS.primary,
  },

  thumb: {
    width: 20,
    height: 20,
    borderRadius: 999,

    backgroundColor: COLORS.white,
  },

  thumbOn: {
    marginLeft: 'auto',
  },
});
