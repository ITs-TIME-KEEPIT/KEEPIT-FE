import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../../constants/colors';
import type { ColorKey } from '../../../constants/clothing';

import ColorChipGroup from '../../clothing/ColorChipGroup';

interface ColorTabProps {
  colors: ColorKey[];
  onChange: (colors: ColorKey[]) => void;
}

export default function ColorTab({
  colors,
  onChange,
}: ColorTabProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.hint}>여러 개 선택할 수 있어요</Text>
      <ColorChipGroup selected={colors} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },

  hint: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 16.8,
    letterSpacing: 0,
    color: COLORS.textPlaceholder,
    includeFontPadding: false,
  },
});
