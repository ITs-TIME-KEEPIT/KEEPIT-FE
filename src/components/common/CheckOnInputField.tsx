
import React from 'react';
import {
  Pressable,
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface CheckOnInputFieldProps {
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default function CheckOnInputField({
  label = '라벨',
  onPress,
  disabled = false,
}: CheckOnInputFieldProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{
        checked: true,
        disabled,
      }}
      style={styles.container}
    >
      <View style={styles.checkbox}>
        <Image
          source={require('../../../assets/icons/check.png')}
          style={styles.checkIcon}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 21,
  },

  checkbox: {
    width: 20,
    height: 20,

    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 4,

    alignItems: 'center',
    justifyContent: 'center',
  },

  checkIcon: {
    width: 12,
    height: 12,
    tintColor: COLORS.white,
  },

  label: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },
});
