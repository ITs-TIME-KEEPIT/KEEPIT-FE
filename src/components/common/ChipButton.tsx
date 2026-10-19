
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface ChipButtonProps {
  title?: string;
  onPress: () => void;
}

export default function ChipButton({
  title = 'Button',
  onPress,
}: ChipButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
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

    minHeight: 34,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,

    backgroundColor: COLORS.bgGray,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    borderRadius: 999,
  },

  label: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },
});
