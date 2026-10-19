
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface CtaDisabledButtonProps {
  title?: string;
}

export default function CtaDisabledButton({
  title = 'Button',
}: CtaDisabledButtonProps) {
  return (
    <Pressable
      disabled={true}
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
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

    backgroundColor: COLORS.line,
    borderRadius: 8,
  },

  label: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    lineHeight: 22.4,
    letterSpacing: 0,

    color: COLORS.textPlaceholder,
    includeFontPadding: false,
  },
});
