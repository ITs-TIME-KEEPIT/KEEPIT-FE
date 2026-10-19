
import React from 'react';
import {
  Pressable,
  View,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface ToggleOnInputFieldProps {
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export default function ToggleOnInputField({
  onPress,
  disabled = false,
  accessibilityLabel = '설정 켜짐',
}: ToggleOnInputFieldProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{
        checked: true,
        disabled,
      }}
      style={styles.toggle}
    >
      <View style={styles.thumb} />
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
    justifyContent: 'flex-end',

    backgroundColor: COLORS.primary,
  },

  thumb: {
    width: 20,
    height: 20,
    borderRadius: 999,

    backgroundColor: COLORS.white,
  },
});
