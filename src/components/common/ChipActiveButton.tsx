
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

    height: 36,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 4,

    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 999,
  },

  label: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.white,
    includeFontPadding: false,
  },
});
