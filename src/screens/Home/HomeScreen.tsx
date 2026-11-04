import React, { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import {
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
import TabBar from '../../components/common/TabBar';
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

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
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

  const clothes = filterClothItems(items, category, appliedFilter, region);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        location={region?.district ?? '전체'}
        onPressLocation={() => setRegionOpen(true)}
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
            style={styles.toolButton}
          >
            <Image source={require('../../../assets/icons/calendar.png')} style={styles.toolIcon} resizeMode="contain" />
          </Pressable>
          <Pressable
            onPress={() => setFilterOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="상세 필터"
            style={styles.toolButton}
          >
            <Image source={require('../../../assets/icons/filter.png')} style={styles.toolIcon} resizeMode="contain" />
          </Pressable>
        </View>
      </View>

      {/* 옷 목록 + FAB */}
      <View style={styles.listArea}>
        <FlatList
          data={clothes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 176 + bottom }]}
          renderItem={({ item }) => (
            <ClothCard
              imageUrl={item.imageUrl}
              title={item.title}
              region={item.region}
              category={item.category}
              size={item.size}
              price={item.price}
              badges={[
                ...(item.laundryIncluded ? [{ label: '세탁 포함' }] : []),
                ...(item.shippingAvailable ? [{ label: '택배 가능', tone: 'gray' as const }] : []),
              ]}
              onPress={() => navigation.navigate('ClothDetail', { clothId: item.id })}
            />
          )}
          // TODO: 캐릭터 시안 확정 후 디자인 적용
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

        <Pressable
          onPress={() =>
            navigation.navigate('ClothRegister')
          }
          accessibilityRole="button"
          style={[styles.fab, { bottom: 90 + Math.max(bottom, 24) }]}
        >
          <Image source={require('../../../assets/icons/plus.png')} style={styles.fabIcon} resizeMode="contain" />
          <Text style={styles.fabText}>옷 올리기</Text>
        </Pressable>
      </View>

      <FilterSheet
        visible={filterOpen}
        value={appliedFilter}
        countFor={(filter) => filterClothItems(items, category, filter, region).length}
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

      {/* 다른 탭 화면이 아직 없어 홈만 활성 */}
      <TabBar active="home" onPressTab={() => {}} />
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
  },

  chips: {
    alignItems: 'center',
    gap: 6,
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

  toolIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.text,
  },

  listArea: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 80, // FAB에 마지막 카드가 가려지지 않도록
  },

  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 4,
  },

  emptyTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    lineHeight: 23.2,
    color: COLORS.text,
    includeFontPadding: false,
  },

  emptySub: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 14,
    paddingRight: 14,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 999,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
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
