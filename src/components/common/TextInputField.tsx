
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface TextInputFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
  onBlur?: () => void;
}

export default function TextInputField({
  label = '라벨',
  placeholder = '입력해주세요',
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  onBlur,
}: TextInputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textPlaceholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        onBlur={onBlur}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    gap: 6,
  },

  label: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  input: {
    width: '100%',
    height: 47,

    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,

    paddingVertical: 12,
    paddingHorizontal: 14,

    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0,
    color: COLORS.text,

    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
