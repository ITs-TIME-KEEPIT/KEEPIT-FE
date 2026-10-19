
import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface CheckInputFieldProps {
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default function CheckInputField({
  label = '라벨',
  onPress,
  disabled = false,
}: CheckInputFieldProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{
        checked: false,
        disabled,
      }}
      style={styles.container}
    >
      <View style={styles.checkbox} />

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

  checkbox: {
    width: 20,
    height: 20,

    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 4,
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
