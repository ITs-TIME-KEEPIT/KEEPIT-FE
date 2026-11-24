import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

import type { MainTabScreenProps } from '../../navigation/RootNavigator';

import { COLORS } from '../../constants/colors';
import { useClothingItems } from '../../state/clothingStore';
import { useRentalState } from '../../state/rentalStore';
import { formatMonthDay } from '../../utils/formatDate';
import { STATUS_STAGE, TRADE_METHOD, stageBadge } from '../../utils/tradeStage';
import { getMyRentals } from '../../api/rental';
import type { MyRentalResponse } from '../../types/rental';

import Badge from '../../components/common/Badge';
import SquareImage from '../../components/common/SquareImage';

const TABS = ['빌린 옷', '빌려준 옷'] as const;

type Card = {
  key: string;
  imageUrl?: string;
  badge: ReturnType<typeof stageBadge>;
  title: string;
  meta: string;
  onPress: () => void;
};

// 'YYYY-MM-DD'를 기기 시간대 자정으로 읽습니다
const day = (date: string) => new Date(`${date}T00:00:00`);

/* MYP-601 내 거래: 빌린 옷 / 빌려준 옷 */
export default function MyTradesScreen({ navigation, route }: MainTabScreenProps<'MyTrades'>) {
  const { bottom } = useSafeAreaInsets();
  const { currentUserId, rentals } = useRentalState();
  const clothes = useClothingItems();
  const [tab, setTab] = useState<(typeof TABS)[number]>(route.params?.tab ?? '빌린 옷');

  const lending = tab === '빌려준 옷';
  const list = rentals.filter(
    (rental) => (lending ? rental.ownerId : rental.borrowerId) === currentUserId,
  );

  // shortcut: 서버 거래를 mock 거래 위에 함께 보여 줍니다, 로그인 연동 후 mock 제거
  // 탭을 바꾸거나 거래 상세에서 돌아오면 다시 불러옵니다
  const focused = useIsFocused();
  const role = lending ? 'OWNER' : 'BORROWER';
  const [response, setResponse] = useState<{
    role?: typeof role;
    items: MyRentalResponse[];
    error?: string;
  }>({ items: [] });
  // 탭을 바꾼 직후 이전 탭 응답이 보이지 않게, 지금 탭의 응답만 씁니다
  const server =
    response.role === role
      ? { ...response, loading: false }
      : { items: [] as MyRentalResponse[], loading: true, error: undefined };

  useEffect(() => {
    if (!focused) return;
    let alive = true;
    getMyRentals(role)
      .then((items) => alive && setResponse({ role, items }))
      .catch((error: Error) => alive && setResponse({ role, items: [], error: error.message }));
    return () => {
      alive = false;
    };
  }, [role, focused]);

  const cards: Card[] = [
    ...server.items.map((item) => ({
      key: `server-${item.rentalId}`,
      imageUrl: item.thumbnailUrl ?? undefined,
      badge: stageBadge(
        { stage: STATUS_STAGE[item.status], createdAt: new Date(item.requestedAt).getTime() },
        lending,
      ),
      title: item.clothingTitle,
      meta: `${formatMonthDay(day(item.startDate))} ~ ${formatMonthDay(day(item.endDate))} · ${item.regionName} · ${TRADE_METHOD[item.tradeMethod]}`,
      // 서버 거래는 상태와 상관없이 거래 상세에서 수락, 거절, 진행을 처리합니다
      onPress: () => navigation.navigate('TradeDetail', { rentalId: String(item.rentalId) }),
    })),
    ...list.map((rental) => {
      const cloth = clothes.find((item) => item.id === rental.clothId);
      return {
        key: rental.id,
        imageUrl: cloth?.imageUrl,
        badge: stageBadge(rental, lending),
        title: cloth?.title ?? '-',
        meta: `${formatMonthDay(new Date(rental.start))} ~ ${formatMonthDay(new Date(rental.end))} · ${cloth?.region ?? '-'} · ${rental.method}`,
        // 등록자가 아직 응답하지 않은 신청은 신청 상세(수락·거절)로, 끝난 거래는 완료 화면으로, 나머지는 거래 상세로
        onPress: () =>
          lending && rental.stage === 'requested'
            ? navigation.navigate('ReceivedRequestDetail', { rentalId: rental.id })
            : navigation.navigate(rental.stage === 'completed' ? 'TradeComplete' : 'TradeDetail', {
                rentalId: rental.id,
              }),
      };
    }),
  ];

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

      {server.loading && <Text style={styles.empty}>거래를 불러오고 있어요</Text>}
      {!!server.error && (
        <Text style={styles.empty}>서버 거래를 불러오지 못했어요. {server.error}</Text>
      )}

      <FlatList
        data={cards}
        keyExtractor={(card) => card.key}
        contentContainerStyle={{ paddingBottom: 110 + bottom }}
        ListEmptyComponent={
          server.loading ? undefined : <Text style={styles.empty}>아직 {tab} 거래가 없어요</Text>
        }
        renderItem={({ item: card }) => (
          <Pressable onPress={card.onPress} accessibilityRole="button" style={styles.card}>
            <SquareImage size={80} source={card.imageUrl ? { uri: card.imageUrl } : undefined} />
            <View style={styles.cardTexts}>
              <Badge label={card.badge.label} tone={card.badge.tone} />
              <Text style={styles.cardTitle} numberOfLines={1}>
                {card.title}
              </Text>
              <Text style={styles.cardMeta} numberOfLines={1}>
                {card.meta}
              </Text>
            </View>
            <Image
              source={require('../../../assets/icons/chevron-right.png')}
              style={styles.chevron}
              resizeMode="contain"
            />
          </Pressable>
        )}
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
