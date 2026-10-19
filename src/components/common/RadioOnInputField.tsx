
import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface RadioOnInputFieldProps {
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default function RadioOnInputField({
  label = '라벨',
  onPress,
  disabled = false,
}: RadioOnInputFieldProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{
        checked: true,
        disabled,
      }}
      style={styles.container}
    >
      <View style={styles.radio}>
        <View style={styles.innerCircle} />
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

    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',
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
