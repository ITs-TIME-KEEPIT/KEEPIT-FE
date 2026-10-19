
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface CtaButtonProps {
  title?: string;
  onPress: () => void;
}

export default function CtaButton({
  title = 'Button',
  onPress,
}: CtaButtonProps) {
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
    height: 52,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 4,

    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },

  label: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    lineHeight: 22.4,
    letterSpacing: 0,
    color: COLORS.white,
    includeFontPadding: false,
  },
});
