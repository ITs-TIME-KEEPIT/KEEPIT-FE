import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MainTabScreenProps } from '../../navigation/RootNavigator';

import { COLORS } from '../../constants/colors';
import { useClothingItems } from '../../state/clothingStore';
import { useRentalState } from '../../state/rentalStore';
import { formatMonthDay } from '../../utils/formatDate';
import { stageBadge } from '../../utils/tradeStage';

import Badge from '../../components/common/Badge';
import SquareImage from '../../components/common/SquareImage';

const TABS = ['빌린 옷', '빌려준 옷'] as const;

/* MYP-601 내 거래: 빌린 옷 / 빌려준 옷 */
export default function MyTradesScreen({ navigation, route }: MainTabScreenProps<'MyTrades'>) {
  const { bottom } = useSafeAreaInsets();
  const { currentUserId, rentals } = useRentalState();
  const clothes = useClothingItems();
  const [tab, setTab] = useState<(typeof TABS)[number]>(route.params?.tab ?? '빌린 옷');

  const lending = tab === '빌려준 옷';
  const list = rentals.filter((rental) => (lending ? rental.ownerId : rental.borrowerId) === currentUserId);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>내 거래</Text>
      </View>

      <View style={styles.tabs}>
        {TABS.map((item) => (
          <Pressable
            key={item}
            onPress={() => setTab(item)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === item }}
            style={[styles.tab, tab === item && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={list}
        keyExtractor={(rental) => rental.id}
        contentContainerStyle={{ paddingBottom: 110 + bottom }}
        ListEmptyComponent={<Text style={styles.empty}>아직 {tab} 거래가 없어요</Text>}
        renderItem={({ item: rental }) => {
          const cloth = clothes.find((item) => item.id === rental.clothId);
          const badge = stageBadge(rental, lending);
          // 등록자가 아직 응답하지 않은 신청은 신청 상세(수락·거절)로, 끝난 거래는 완료 화면으로, 나머지는 거래 상세로
          const goDetail = () =>
            lending && rental.stage === 'requested'
              ? navigation.navigate('ReceivedRequestDetail', { rentalId: rental.id })
              : navigation.navigate(rental.stage === 'completed' ? 'TradeComplete' : 'TradeDetail', { rentalId: rental.id });

          return (
            <Pressable onPress={goDetail} accessibilityRole="button" style={styles.card}>
              <SquareImage size={80} source={cloth?.imageUrl ? { uri: cloth.imageUrl } : undefined} />
              <View style={styles.cardTexts}>
                <Badge label={badge.label} tone={badge.tone} />
                <Text style={styles.cardTitle} numberOfLines={1}>{cloth?.title ?? '-'}</Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {formatMonthDay(new Date(rental.start))} ~ {formatMonthDay(new Date(rental.end))} · {cloth?.region ?? '-'} · {rental.method}
                </Text>
              </View>
              <Image
                source={require('../../../assets/icons/chevron-right.png')}
                style={styles.chevron}
                resizeMode="contain"
              />
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  titleBar: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  title: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    lineHeight: 29,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  tabs: {
    flexDirection: 'row',
    paddingTop: 8,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.text,
  },

  tabText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    lineHeight: 21.75,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  tabTextActive: {
    fontFamily: 'Pretendard-SemiBold',
    color: COLORS.text,
  },

  empty: {
    paddingVertical: 60,
    textAlign: 'center',
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },

  cardTexts: {
    flex: 1,
    gap: 4,
  },

  cardTitle: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    lineHeight: 21.75,
    color: COLORS.text,
    includeFontPadding: false,
  },

  cardMeta: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18.85,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  chevron: {
    width: 24,
    height: 24,
    tintColor: COLORS.text,
  },
});
