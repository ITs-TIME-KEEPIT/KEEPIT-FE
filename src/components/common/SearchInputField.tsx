import React from 'react';
import { View, TextInput, Image, Pressable, StyleSheet } from 'react-native';

import { COLORS } from '../../constants/colors';

interface SearchInputFieldProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  onClear?: () => void; // 넘기면 입력값이 있을 때 지우기(x) 버튼 표시
}

export default function SearchInputField({
  placeholder = '입력해주세요',
  value,
  onChangeText,
  onSubmitEditing,
  editable = true,
  autoFocus = false,
  onClear,
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
        placeholderTextColor={COLORS.textSub}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        underlineColorAndroid="transparent"
        accessibilityLabel="검색어 입력"
      />

      {onClear && value.length > 0 && (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="검색어 지우기"
          hitSlop={8}
          style={styles.clear}
        >
          <Image
            source={require('../../../assets/icons/x.png')}
            style={styles.clearIcon}
            resizeMode="contain"
          />
        </Pressable>
      )}
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
    borderRadius: 12,

    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },

  searchIcon: {
    width: 16,
    height: 16,
    tintColor: COLORS.textPlaceholder,
  },

  clear: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: COLORS.line,
  },

  clearIcon: {
    width: 12,
    height: 12,
    tintColor: COLORS.textSub,
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
