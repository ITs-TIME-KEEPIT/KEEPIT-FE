import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';
import { COLORS as CLOTH_COLORS } from '../../constants/clothing';

interface ColorChipProps {
  color: (typeof CLOTH_COLORS)[number];
  selected: boolean;
  onPress: () => void;
}

export default function ColorChip({
  color,
  selected,
  onPress,
}: ColorChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={color.label}
      style={styles.container}
    >
      <View style={[styles.ring, selected && styles.ringActive]}>
        {color.hex === null ? (
          <Image
            source={require('../../../assets/icons/color-etc.png')}
            style={styles.swatch}
          />
        ) : (
          <View
            style={[
              styles.swatch,
              { backgroundColor: color.hex },
              color.key === 'white' && styles.swatchWhite,
            ]}
          />
        )}
      </View>

      <Text style={styles.label}>
        {color.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },

  ring: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringActive: {
    borderColor: COLORS.primary,
  },

  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  // 화이트는 배경과 구분되도록 테두리
  swatchWhite: {
    borderWidth: 1,
    borderColor: COLORS.line,
  },

  label: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },
});

/*
ColorChip 사용법 - 최종 배포 시 주석은 삭제 예정

컬러 하나 (40 영역 / 32 원 / 이름). 선택 시 primary 링.

import ColorChip from '../../components/clothing/ColorChip';
import { COLORS as CLOTH_COLORS } from '../../constants/clothing';

<ColorChip color={CLOTH_COLORS[0]} selected={false} onPress={() => {}} />
*/
