import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';
import { REGIONS, SIDOS } from '../../constants/regions';
import type { Region, Sido } from '../../constants/regions';

import BottomSheet from './BottomSheet';

interface RegionSheetProps {
  visible: boolean;
  value: Region;
  onSelect: (region: Region) => void; // 누르면 바로 적용 (닫기는 부모에서)
  onClose: () => void;
  title?: string;
  showAll?: boolean; // 홈에서만 맨 위 '전체' 표시
}

export default function RegionSheet({
  visible,
  value,
  onSelect,
  onClose,
  title = '지역을 선택해주세요',
  showAll = false,
}: RegionSheetProps) {
  const [sido, setSido] = useState<Sido>(value?.sido ?? '서울');

  // 열릴 때 현재 선택된 시/도를 보여줌
  useEffect(() => {
    if (visible) setSido(value?.sido ?? '서울');
  }, [visible]);

  return (
    <BottomSheet visible={visible} title={title} onClose={onClose}>
      <View style={styles.list}>
        <View style={styles.sidoColumn}>
          {showAll && (
            <Pressable
              onPress={() => onSelect(null)}
              accessibilityRole="button"
              accessibilityState={{ selected: value === null }}
              style={styles.row}
            >
              <Text style={styles.sido}>
                전체
              </Text>
            </Pressable>
          )}

          {SIDOS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setSido(item)}
              accessibilityRole="tab"
              accessibilityState={{ selected: item === sido }}
              style={[styles.row, item === sido && styles.sidoRowActive]}
            >
              <Text style={item === sido ? styles.sidoActive : styles.sido}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView style={styles.districtColumn}>
          {REGIONS[sido].map((district) => {
            const selected = value?.sido === sido && value.district === district;
            return (
              <Pressable
                key={district}
                onPress={() => onSelect({ sido, district })}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.row, selected && styles.districtRowActive]}
              >
                <Text style={selected ? styles.districtActive : styles.district}>
                  {district}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Text style={styles.hint}>
        서울·경기·인천만 선택할 수 있어요
      </Text>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    height: 432,
    flexDirection: 'row',
  },

  sidoColumn: {
    width: 112,
    backgroundColor: COLORS.line,
    borderRadius: 8,
    overflow: 'hidden',
  },

  districtColumn: {
    flex: 1,
  },

  row: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  sidoRowActive: {
    backgroundColor: COLORS.white,
  },

  districtRowActive: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },

  sido: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    letterSpacing: 0,
    color: COLORS.textPlaceholder,
    includeFontPadding: false,
  },

  sidoActive: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  district: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  districtActive: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    letterSpacing: 0,
    color: COLORS.primary,
    includeFontPadding: false,
  },

  hint: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    letterSpacing: 0,
    color: COLORS.textPlaceholder,
    includeFontPadding: false,
  },
});