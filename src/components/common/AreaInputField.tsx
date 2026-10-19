
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface AreaInputFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  maxLength?: number;
}

export default function AreaInputField({
  label = '라벨',
  placeholder = '입력해주세요',
  value,
  onChangeText,
  editable = true,
  maxLength,
}: AreaInputFieldProps) {
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
        editable={editable}
        maxLength={maxLength}
        multiline={true}
        textAlignVertical="top"
        underlineColorAndroid="transparent"
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
    height: 120,

    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,

    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 14,

    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0,
    color: COLORS.text,

    includeFontPadding: false,
    textAlignVertical: 'top',
  },
});
