
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface ChipActiveButtonProps {
  title?: string;
  onPress: () => void;
}

export default function ChipActiveButton({
  title = 'Button',
  onPress,
}: ChipActiveButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: true }}
      style={styles.button}
    >
      <Text style={styles.label}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    minHeight: 32,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,

    backgroundColor: COLORS.primary,
    borderRadius: 999,
  },

  label: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0,
    color: COLORS.white,
    includeFontPadding: false,
  },
});
