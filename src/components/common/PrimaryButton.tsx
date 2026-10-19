
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface PrimaryButtonProps {
  title?: string;
  onPress: () => void;
}

export default function PrimaryButton({
  title = 'Button',
  onPress,
}: PrimaryButtonProps) {
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

    height: 40,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 4,

    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },

  label: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0,
    color: COLORS.white,
    includeFontPadding: false,
  },
});
