import React, { useEffect, useRef, useState } from 'react';
import type { MainTabScreenProps } from '../../navigation/RootNavigator';
import {
  Animated,
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../../constants/colors';

import Header from '../../components/common/Header';
import ChipButton from '../../components/common/ChipButton';
import ChipActiveButton from '../../components/common/ChipActiveButton';
import ClothCard from '../../components/clothing/ClothCard';
import FilterSheet from '../../components/bottomsheet/FilterSheet';
import RegionSheet from '../../components/bottomsheet/RegionSheet';
import DateRangeSheet from '../../components/bottomsheet/DateRangeSheet';

import { CATEGORIES } from '../../constants/clothing';
import type { Region } from '../../constants/regions';
import { INITIAL_FILTER } from '../../types/filter';
import type { DateRange, DetailFilter } from '../../types/filter';
import { useClothingItems } from '../../state/clothingStore';
import { filterClothItems } from '../../utils/filterClothItems';

const CATEGORY_CHIPS = ['전체', ...CATEGORIES] as const;

const showPreparing = (message: string) => Alert.alert('준비 중', message);

export default function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const { bottom } = useSafeAreaInsets();
  const items = useClothingItems();
  const [category, setCategory] = useState<(typeof CATEGORY_CHIPS)[number]>('전체');
  const [appliedFilter, setAppliedFilter] = useState<DetailFilter>(INITIAL_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  const [region, setRegion] = useState<Region>(null);
  const [regionOpen, setRegionOpen] = useState(false);
  // shortcut: 더미 데이터에 예약 날짜가 없어 기간은 목록에 반영하지 않음, API 연동 시 filterClothItems에 추가
  const [dateRange, setDateRange] = useState<DateRange>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const fabCollapse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // width는 네이티브 드라이버로 애니메이션할 수 없음
    Animated.timing(fabCollapse, {
      toValue: scrolled ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [scrolled, fabCollapse]);

  const visibleItems = items.filter(item => !item.hidden && !item.deleted);
  const clothes = filterClothItems(visibleItems, category, appliedFilter, region);
  const { price, sizes, colors } = appliedFilter;
  const filterActive = price.min > 0 || price.max !== null || sizes.length > 0 || colors.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        location={region?.district ?? '전체'}
        onPressLocation={() => setRegionOpen(true)}
        // 알림은 서버(푸시·알림 API) 연동 후 제공
        onPressBell={() => showPreparing('알림은 서버 연동 후 사용할 수 있어요.')}
      />

      {/* 필터 바 */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chips}
        >
          {CATEGORY_CHIPS.map((item) =>
            item === category ? (
              <ChipActiveButton key={item} title={item} onPress={() => setCategory(item)} />
            ) : (
              <ChipButton key={item} title={item} onPress={() => setCategory(item)} />
            ),
          )}
        </ScrollView>

        <View style={styles.divider} />

        <View style={styles.tools}>
          <Pressable
            onPress={() => setDateOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="날짜 선택"
            style={[styles.toolButton, dateRange && styles.toolButtonActive]}
          >
            <Image source={require('../../../assets/icons/calendar.png')} style={[styles.toolIcon, dateRange && styles.toolIconActive]} resizeMode="contain" />
          </Pressable>
          <Pressable
            onPress={() => setFilterOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="상세 필터"
            style={[styles.toolButton, filterActive && styles.toolButtonActive]}
          >
            <Image source={require('../../../assets/icons/filter.png')} style={[styles.toolIcon, filterActive && styles.toolIconActive]} resizeMode="contain" />
          </Pressable>
        </View>
      </View>

      {/* 옷 목록 + FAB */}
      <View style={styles.listArea}>
        <FlatList
          data={clothes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={clothes.length ? { paddingBottom: 176 + bottom } : styles.emptyContent}
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
              badges={[
                ...(item.laundryIncluded ? [{ label: '세탁 포함' }] : []),
                ...(item.shippingAvailable ? [{ label: '택배 가능', tone: 'gray' as const }] : []),
              ]}
              onPress={() => navigation.navigate('ClothDetail', { clothId: item.id })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                조건에 맞는 옷이 없어요
              </Text>
              <Text style={styles.emptySub}>
                날짜나 카테고리를 바꿔보세요
              </Text>
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
              onPress={() =>
                navigation.navigate('ClothRegister')
              }
              accessibilityRole="button"
              accessibilityLabel="옷 올리기"
              style={styles.fabButton}
            >
              <Image source={require('../../../assets/icons/plus.png')} style={styles.fabIcon} resizeMode="contain" />
              <Animated.Text
                style={[
                  styles.fabText,
                  { opacity: fabCollapse.interpolate({ inputRange: [0, 0.6], outputRange: [1, 0], extrapolate: 'clamp' }) },
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

  listArea: {
    flex: 1,
  },

  emptyContent: {
    flexGrow: 1,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  emptyTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    lineHeight: 29,
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
