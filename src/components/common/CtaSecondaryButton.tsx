
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface CtaSecondaryButtonProps {
  title?: string;
  onPress: () => void;
}

export default function CtaSecondaryButton({
  title = 'Button',
  onPress,
}: CtaSecondaryButtonProps) {
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
    width: '100%',
    height: 56,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },

  label: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
    lineHeight: 26.1,
    letterSpacing: 0,
    color: COLORS.primary,
    includeFontPadding: false,
  },
});
