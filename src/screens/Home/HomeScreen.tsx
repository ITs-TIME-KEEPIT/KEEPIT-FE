import React, { useEffect, useState } from 'react';
import type { MainTabScreenProps } from '../../navigation/RootNavigator';
import { Animated, View, Text, Image, Pressable, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../../constants/colors';

import Header from '../../components/common/Header';
import ClothCard from '../../components/clothing/ClothCard';
import FilterBar, { type CategoryChip } from '../../components/clothing/FilterBar';
import SecondaryButton from '../../components/common/SecondaryButton';
import FilterSheet from '../../components/bottomsheet/FilterSheet';
import RegionSheet from '../../components/bottomsheet/RegionSheet';
import DateRangeSheet from '../../components/bottomsheet/DateRangeSheet';

import type { Region } from '../../constants/regions';
import { INITIAL_FILTER } from '../../types/filter';
import type { DateRange, DetailFilter } from '../../types/filter';
import { useClothingItems } from '../../state/clothingStore';
import { clothBadges, filterClothItems, isFilterActive } from '../../utils/filterClothItems';

export default function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const { bottom } = useSafeAreaInsets();
  const items = useClothingItems();
  const [category, setCategory] = useState<CategoryChip>('전체');
  const [appliedFilter, setAppliedFilter] = useState<DetailFilter>(INITIAL_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  const [region, setRegion] = useState<Region>(null);
  const [regionOpen, setRegionOpen] = useState(false);
  // shortcut: 더미 데이터에 예약 날짜가 없어 기간은 목록에 반영하지 않음, API 연동 시 filterClothItems에 추가
  const [dateRange, setDateRange] = useState<DateRange>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const fabCollapse = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    // width는 네이티브 드라이버로 애니메이션할 수 없음
    Animated.timing(fabCollapse, {
      toValue: scrolled ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [scrolled, fabCollapse]);

  const visibleItems = items.filter((item) => !item.hidden && !item.deleted);
  const clothes = filterClothItems(visibleItems, category, appliedFilter, region);
  const filterActive = isFilterActive(appliedFilter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        location={region?.district ?? '전체'}
        onPressLocation={() => setRegionOpen(true)}
        onPressSearch={() => navigation.navigate('Search')}
        onPressBell={() => navigation.navigate('Notifications')}
      />

      <FilterBar
        category={category}
        onChangeCategory={setCategory}
        dateActive={!!dateRange}
        filterActive={filterActive}
        onPressDate={() => setDateOpen(true)}
        onPressFilter={() => setFilterOpen(true)}
      />

      {/* 옷 목록 + FAB */}
      <View style={styles.listArea}>
        <FlatList
          data={clothes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            clothes.length ? { paddingBottom: 176 + bottom } : styles.emptyContent
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
              <Text style={styles.emptyTitle}>조건에 맞는 옷이 없어요</Text>
              <Text style={styles.emptySub}>날짜나 필터를 바꿔보세요</Text>
              {filterActive && (
                <SecondaryButton
                  title="필터 초기화"
                  onPress={() => setAppliedFilter(INITIAL_FILTER)}
                  style={styles.resetButton}
                />
              )}
            </View>
          }
        />

        {clothes.length > 0 && (
          <Animated.View
            style={[
              styles.fab,
              {
                bottom: 90 + Math.max(bottom, 24),
                width: fabCollapse.interpolate({ inputRange: [0, 1], outputRange: [112, 52] }),
              },
            ]}
          >
            <Pressable
              onPress={() => navigation.navigate('ClothRegister')}
              accessibilityRole="button"
              accessibilityLabel="옷 올리기"
              style={styles.fabButton}
            >
              <Image
                source={require('../../../assets/icons/plus.png')}
                style={styles.fabIcon}
                resizeMode="contain"
              />
              <Animated.Text
                style={[
                  styles.fabText,
                  {
                    opacity: fabCollapse.interpolate({
                      inputRange: [0, 0.6],
                      outputRange: [1, 0],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              >
                옷 올리기
              </Animated.Text>
            </Pressable>
          </Animated.View>
        )}
      </View>

      <FilterSheet
        visible={filterOpen}
        value={appliedFilter}
        countFor={(filter) => filterClothItems(visibleItems, category, filter, region).length}
        onApply={(filter) => {
          setAppliedFilter(filter);
          setFilterOpen(false);
        }}
        onClose={() => setFilterOpen(false)}
      />

      <RegionSheet
        visible={regionOpen}
        value={region}
        showAll
        onSelect={(next) => {
          setRegion(next);
          setRegionOpen(false);
        }}
        onClose={() => setRegionOpen(false)}
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

  listArea: {
    flex: 1,
  },

  emptyContent: {
    flexGrow: 1,
  },

  // Figma: 필터 바 아래에서 144, 캐릭터~제목 20, 제목~안내 8
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 144,
    paddingHorizontal: 20,
  },

  character: {
    width: 90,
    height: 98,
    marginBottom: 12,
  },

  emptyTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    lineHeight: 23.2,
    color: COLORS.text,
    includeFontPadding: false,
  },

  emptySub: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  // Figma: 안내 문구와 버튼 사이 17 (gap 8 + 9)
  resetButton: {
    alignSelf: 'center',
    marginTop: 9,
  },

  fab: {
    position: 'absolute',
    right: 25,
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 999,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },

  // 줄어드는 동안 글자를 잘라내되 그림자는 살리려고 바깥 뷰와 분리
  fabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 14,
    borderRadius: 999,
    overflow: 'hidden',
  },

  fabIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },

  fabText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 15,
    lineHeight: 21.75,
    letterSpacing: 0,
    color: COLORS.white,
    includeFontPadding: false,
  },
});
