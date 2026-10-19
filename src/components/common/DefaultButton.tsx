
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface DefaultButtonProps {
  title?: string;
  onPress: () => void;
}

export default function DefaultButton({
  title = 'Button',
  onPress,
}: DefaultButtonProps) {
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
    justifyContent: 'center',
    minHeight: 20,
  },

  label: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },
});
