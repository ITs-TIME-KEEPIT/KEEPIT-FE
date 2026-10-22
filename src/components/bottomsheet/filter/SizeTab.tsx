import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../../constants/colors';
import { SIZES } from '../../../constants/clothing';
import type { Size } from '../../../constants/clothing';

import ChipButton from '../../common/ChipButton';
import ChipActiveButton from '../../common/ChipActiveButton';

const SIZE_GROUPS = [
  { title: '알파벳 사이즈', sizes: SIZES.filter((size) => size !== 'FREE') },
  { title: '기타', sizes: ['FREE'] as Size[] },
];

interface SizeTabProps {
  sizes: Size[];
  onChange: (sizes: Size[]) => void;
}

export default function SizeTab({
  sizes,
  onChange,
}: SizeTabProps) {
  const toggle = (size: Size) =>
    onChange(sizes.includes(size) ? sizes.filter((s) => s !== size) : [...sizes, size]);

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>여러 개 선택할 수 있어요</Text>

      {SIZE_GROUPS.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.chips}>
            {group.sizes.map((size) =>
              sizes.includes(size) ? (
                <ChipActiveButton key={size} title={size} onPress={() => toggle(size)} />
              ) : (
                <ChipButton key={size} title={size} onPress={() => toggle(size)} />
              ),
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },

  group: {
    gap: 10,
  },

  groupTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  hint: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 16.8,
    letterSpacing: 0,
    color: COLORS.textPlaceholder,
    includeFontPadding: false,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
});
