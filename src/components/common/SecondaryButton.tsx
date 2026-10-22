
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface SecondaryButtonProps {
  title?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function SecondaryButton({
  title = 'Button',
  onPress,
  style,
}: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.button, style]}
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

    minHeight: 42,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 4,

    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 6,
  },

  label: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0,
    color: COLORS.primary,
    includeFontPadding: false,
  },
});
