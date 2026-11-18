import React from 'react';
import { View, Image, Pressable, ScrollView, StyleSheet } from 'react-native';

import { COLORS } from '../../constants/colors';
import { CATEGORIES } from '../../constants/clothing';
import ChipButton from '../common/ChipButton';
import ChipActiveButton from '../common/ChipActiveButton';

export const CATEGORY_CHIPS = ['전체', ...CATEGORIES] as const;
export type CategoryChip = (typeof CATEGORY_CHIPS)[number];

interface FilterBarProps {
  category: CategoryChip;
  onChangeCategory: (category: CategoryChip) => void;
  dateActive: boolean;
  filterActive: boolean;
  onPressDate: () => void;
  onPressFilter: () => void;
}

/* 카테고리 칩(가로 스크롤) + 날짜·상세 필터 버튼 (홈, 검색 결과) */
export default function FilterBar({
  category,
  onChangeCategory,
  dateActive,
  filterActive,
  onPressDate,
  onPressFilter,
}: FilterBarProps) {
  return (
    <View style={styles.filterBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chips}
      >
        {CATEGORY_CHIPS.map((item) =>
          item === category ? (
            <ChipActiveButton key={item} title={item} onPress={() => onChangeCategory(item)} />
          ) : (
            <ChipButton key={item} title={item} onPress={() => onChangeCategory(item)} />
          ),
        )}
      </ScrollView>

      <View style={styles.divider} />

      <View style={styles.tools}>
        <Pressable
          onPress={onPressDate}
          accessibilityRole="button"
          accessibilityLabel="날짜 선택"
          style={[styles.toolButton, dateActive && styles.toolButtonActive]}
        >
          <Image
            source={require('../../../assets/icons/calendar.png')}
            style={[styles.toolIcon, dateActive && styles.toolIconActive]}
            resizeMode="contain"
          />
        </Pressable>
        <Pressable
          onPress={onPressFilter}
          accessibilityRole="button"
          accessibilityLabel="상세 필터"
          style={[styles.toolButton, filterActive && styles.toolButtonActive]}
        >
          <Image
            source={require('../../../assets/icons/filter.png')}
            style={[styles.toolIcon, filterActive && styles.toolIconActive]}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    height: 54,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },

  chipScroll: {
    flex: 1,
    marginRight: 5,
  },

  chips: {
    alignItems: 'center',
    gap: 12,
  },

  divider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.line,
  },

  tools: {
    flexDirection: 'row',
    gap: 6,
  },

  toolButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 999,
  },

  toolButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  toolIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.text,
  },

  toolIconActive: {
    tintColor: COLORS.white,
  },
});
