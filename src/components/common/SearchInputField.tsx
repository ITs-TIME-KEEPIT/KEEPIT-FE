
import React from 'react';
import {
  View,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface SearchInputFieldProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  editable?: boolean;
}

export default function SearchInputField({
  placeholder = '입력해주세요',
  value,
  onChangeText,
  onSubmitEditing,
  editable = true,
}: SearchInputFieldProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/icons/search.png')}
        style={styles.searchIcon}
        resizeMode="contain"
      />

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textPlaceholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        underlineColorAndroid="transparent"
        accessibilityLabel="검색어 입력"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 41,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.bgGray,
    borderRadius: 8,

    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },

  searchIcon: {
    width: 16,
    height: 16,
    tintColor: COLORS.textPlaceholder,
  },

  input: {
    flex: 1,
    height: '100%',
    padding: 0,

    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0,
    color: COLORS.text,

    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
