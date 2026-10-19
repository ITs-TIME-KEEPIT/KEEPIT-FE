
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface DefaultActiveButtonProps {
  title?: string;
  onPress: () => void;
}

export default function DefaultActiveButton({
  title = 'Button',
  onPress,
}: DefaultActiveButtonProps) {
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
    justifyContent: 'center',
    minHeight: 20,
  },

  label: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },
});
