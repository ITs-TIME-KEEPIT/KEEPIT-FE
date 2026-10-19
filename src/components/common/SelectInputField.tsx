
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export default function SelectInputField({
  label = '라벨',
  placeholder = '입력해주세요',
  value,
  options,
  onValueChange,
  disabled = false,
}: SelectInputFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <View
      style={[
        styles.container,
        isOpen && styles.containerOpen,
      ]}
    >
      <Text style={styles.label}>
        {label}
      </Text>

      <View style={styles.selectContainer}>
        <Pressable
          onPress={() => setIsOpen(!isOpen)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{
            expanded: isOpen,
            disabled,
          }}
          style={styles.inputBox}
        >
          <Text
            style={[
              styles.inputText,
              !selectedOption && styles.placeholder,
            ]}
            numberOfLines={1}
          >
            {selectedOption
              ? selectedOption.label
              : placeholder}
          </Text>

          <Image
            source={require('../../../assets/icons/Vector.png')}
            style={styles.arrow}
            resizeMode="contain"
          />
        </Pressable>

        {isOpen && (
          <View style={styles.dropdown}>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={styles.optionList}
            >
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: option.value === value,
                  }}
                  style={styles.option}
                >
                  <Text
                    style={[
                      styles.optionText,
                      option.value === value &&
                        styles.selectedText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    gap: 6,
    zIndex: 0,
  },

  containerOpen: {
    zIndex: 100,
    elevation: 10,
  },

  label: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  selectContainer: {
    width: '100%',
    position: 'relative',
  },

  inputBox: {
    width: '100%',
    height: 47,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,

    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },

  inputText: {
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  placeholder: {
    color: COLORS.textPlaceholder,
  },

  arrow: {
    width: 8,
    height: 4,
  },

  dropdown: {
    position: 'absolute',
    top: 51,
    left: 0,
    right: 0,

    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,

    zIndex: 100,
    elevation: 5,
    overflow: 'hidden',
  },

  optionList: {
    maxHeight: 200,
  },

  option: {
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },

  optionText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.text,
    includeFontPadding: false,
  },

  selectedText: {
    fontFamily: 'Pretendard-Medium',
    color: COLORS.primary,
  },
});
