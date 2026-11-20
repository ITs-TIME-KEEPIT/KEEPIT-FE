import React, { useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, Image, Pressable, FlatList, StyleSheet, Keyboard } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { COLORS } from '../../constants/colors';

import SearchInputField from '../../components/common/SearchInputField';
import ClothCard from '../../components/clothing/ClothCard';
import FilterBar, { type CategoryChip } from '../../components/clothing/FilterBar';
import FilterSheet from '../../components/bottomsheet/FilterSheet';
import DateRangeSheet from '../../components/bottomsheet/DateRangeSheet';

import { INITIAL_FILTER } from '../../types/filter';
import type { DateRange, DetailFilter } from '../../types/filter';
import { useClothingItems } from '../../state/clothingStore';
import {
  clothBadges,
  filterClothItems,
  isFilterActive,
  matchesQuery,
} from '../../utils/filterClothItems';

const MAX_RECENT = 10;
// shortcut: 최근 검색어를 앱 실행 중에만 기억 (앱을 껐다 켜면 사라짐), 저장소 도입 시 AsyncStorage로 이동
let savedRecent: string[] = [];
const saveRecent = (next: string[]) => {
  savedRecent = next;
};

/* 검색 (Figma A. 검색 · 검색-결과 · 검색-결과 없음) */
export default function SearchScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Search'>) {
  const { bottom } = useSafeAreaInsets();
  const items = useClothingItems();
  const listRef = useRef<FlatList>(null);
  const [text, setText] = useState('');
  const [query, setQuery] = useState(''); // 검색 버튼을 누른 검색어
  const [recent, setRecent] = useState(savedRecent);
  const [category, setCategory] = useState<CategoryChip>('전체');
  const [appliedFilter, setAppliedFilter] = useState<DetailFilter>(INITIAL_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  // shortcut: 홈과 같이 더미 데이터에 예약 날짜가 없어 기간은 결과에 반영하지 않음
  const [dateRange, setDateRange] = useState<DateRange>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const updateRecent = (next: string[]) => {
    saveRecent(next);
    setRecent(next);
  };

  const search = (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    setText(trimmed);
    setQuery(trimmed);
    updateRecent([trimmed, ...recent.filter((word) => word !== trimmed)].slice(0, MAX_RECENT));
  };

  const matched = items.filter(
    (item) => !item.hidden && !item.deleted && matchesQuery(item, query),
  );
  const results = filterClothItems(matched, category, appliedFilter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchHeader}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          hitSlop={8}
        >
          <Image
            source={require('../../../assets/icons/chevron-left.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>
        <View style={styles.inputWrap}>
          <SearchInputField
            placeholder="어떤 옷을 찾으세요?"
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => search(text)}
            onClear={() => {
              setText('');
              setQuery('');
            }}
            autoFocus
          />
        </View>
      </View>

      {!query ? (
        <View style={styles.recent}>
          {recent.length > 0 && (
            <>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>최근 검색어</Text>
                <Pressable onPress={() => updateRecent([])} accessibilityRole="button" hitSlop={8}>
                  <Text style={styles.clearAll}>전체 삭제</Text>
                </Pressable>
              </View>
              <View style={styles.recentChips}>
                {recent.map((word) => (
                  <View key={word} style={styles.recentChip}>
                    <Pressable onPress={() => search(word)} accessibilityRole="button">
                      <Text style={styles.recentText}>{word}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => updateRecent(recent.filter((item) => item !== word))}
                      accessibilityRole="button"
                      accessibilityLabel={`${word} 삭제`}
                      hitSlop={8}
                    >
                      <Image
                        source={require('../../../assets/icons/x.png')}
                        style={styles.recentRemove}
                        resizeMode="contain"
                      />
                    </Pressable>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.resultArea}>
          {results.length > 0 && (
            <Text style={styles.count}>
              검색 결과 <Text style={styles.countNumber}>{results.length}개</Text>
            </Text>
          )}

          <FilterBar
            category={category}
            onChangeCategory={setCategory}
            dateActive={!!dateRange}
            filterActive={isFilterActive(appliedFilter)}
            onPressDate={() => setDateOpen(true)}
            onPressFilter={() => setFilterOpen(true)}
          />

          <FlatList
            ref={listRef}
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              results.length ? { paddingBottom: 96 + bottom } : styles.emptyContent
            }
            onScroll={(event) => setScrolled(event.nativeEvent.contentOffset.y > 0)}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <ClothCard
                imageUrl={item.imageUrl}
                title={item.title}
                region={item.region}
                category={item.category}
                size={item.size}
                date={item.detail?.postedLabel}
                price={item.price}
                badges={clothBadges(item)}
                onPress={() => navigation.navigate('ClothDetail', { clothId: item.id })}
              />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Image
                  source={require('../../../assets/icons/char-error.png')}
                  style={styles.character}
                  resizeMode="contain"
                />
                <Text style={styles.emptyTitle}>{`'${query}'에 맞는 옷이 없어요`}</Text>
                <Text style={styles.emptySub}>검색어나 필터를 바꿔보세요</Text>
              </View>
            }
          />

          {scrolled && (
            <Pressable
              onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
              accessibilityRole="button"
              accessibilityLabel="맨 위로"
              style={styles.topButton}
            >
              <Image
                source={require('../../../assets/icons/chevron-down.png')}
                style={styles.topIcon}
                resizeMode="contain"
              />
            </Pressable>
          )}
        </View>
      )}

      <FilterSheet
        visible={filterOpen}
        value={appliedFilter}
        countFor={(filter) => filterClothItems(matched, category, filter).length}
        onApply={(filter) => {
          setAppliedFilter(filter);
          setFilterOpen(false);
        }}
        onClose={() => setFilterOpen(false)}
      />

      <DateRangeSheet
        visible={dateOpen}
        value={dateRange}
        onApply={(range) => {
          setDateRange(range);
          setDateOpen(false);
        }}
        onClose={() => setDateOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  searchHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 16,
  },

  backIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.text,
  },

  inputWrap: {
    flex: 1,
  },

  recent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },

  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  recentTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    lineHeight: 23.2,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  clearAll: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingLeft: 12,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 999,
    backgroundColor: COLORS.white,
  },

  recentText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  recentRemove: {
    width: 14,
    height: 14,
    tintColor: COLORS.text,
  },

  resultArea: {
    flex: 1,
  },

  count: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  countNumber: {
    fontFamily: 'Pretendard-Medium',
    color: COLORS.text,
  },

  emptyContent: {
    flexGrow: 1,
  },

  // Figma: 필터 바 아래에서 144px
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 144,
    paddingHorizontal: 20,
  },

  character: {
    width: 90,
    height: 98,
    marginBottom: 10,
  },

  emptyTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    lineHeight: 23.2,
    letterSpacing: 0,
    color: COLORS.text,
    textAlign: 'center',
    includeFontPadding: false,
  },

  emptySub: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  // Figma: 화면 오른쪽 30, 맨 아래 31
  topButton: {
    position: 'absolute',
    right: 30,
    bottom: 31,
    padding: 14,
    borderRadius: 999,
    backgroundColor: COLORS.primary,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },

  // 위쪽 화살표 아이콘이 없어 아래 화살표를 뒤집어 사용
  topIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
    transform: [{ rotate: '180deg' }],
  },
});
