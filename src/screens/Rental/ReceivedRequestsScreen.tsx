import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import { serverClothesId } from '../../api/clothing';
import { getReceivedRentalRequests } from '../../api/rental';
import { COLORS } from '../../constants/colors';
import { DEMO_IDS } from '../../mocks/demoScenario';
import { useClothingItems } from '../../state/clothingStore';
import { findDemoUser, hoursLeft, overlaps, useRentalState } from '../../state/rentalStore';
import type { ReceivedRentalRequestResponse, Rental } from '../../types/rental';
import { formatDate } from '../../utils/formatDate';
import { hoursUntil, toRental } from '../../utils/tradeStage';

import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import ItemSummary from '../../components/rental/ItemSummary';
import PersonRow from '../../components/rental/PersonRow';

type Props = NativeStackScreenProps<RootStackParamList, 'ReceivedRequests'>;

type Card = {
  rental: Rental;
  name: string;
  sub: string;
  clothTitle: string;
  hours: number;
  fromServer: boolean;
};

const countDays = (start: number, end: number) =>
  Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1;

/* 받은 신청 목록. clothId가 있으면 그 옷의 신청만, 없으면(마이에서 진입) 내 옷 전체 */
export default function ReceivedRequestsScreen({ navigation, route }: Props) {
  const clothId = route.params?.clothId;
  const clothes = useClothingItems();
  const { currentUserId, rentals } = useRentalState();

  const requests = rentals.filter(
    (rental) =>
      rental.ownerId === currentUserId &&
      rental.stage === 'requested' &&
      (!clothId || rental.clothId === clothId),
  );
  const cloth = clothId ? clothes.find((item) => item.id === clothId) : undefined;

  // shortcut: 서버 신청을 mock과 함께 보여 줍니다, 전체 API 연동 후 mock 제거
  // 로그인 연동 전이라 서버의 '나'는 .env 토큰의 사용자입니다. 데모 등록자일 때만 부르고, 옷별 화면은 서버 옷일 때만 부릅니다
  const serverClothId = clothId ? serverClothesId(clothId) : undefined;
  const skipServer = currentUserId !== DEMO_IDS.owner || (!!clothId && !serverClothId);
  const [server, setServer] = useState<{
    items: ReceivedRentalRequestResponse[];
    loading: boolean;
    error?: string;
  }>({ items: [], loading: true });

  // 상세에서 수락, 거절하고 돌아오면 목록을 다시 불러옵니다
  const focused = useIsFocused();

  useEffect(() => {
    if (skipServer || !focused) return;
    let alive = true;
    getReceivedRentalRequests({
      status: 'REQUESTED',
      clothesId: serverClothId ? Number(serverClothId) : undefined,
    })
      .then((items) => alive && setServer({ items, loading: false }))
      .catch(
        (error: Error) => alive && setServer({ items: [], loading: false, error: error.message }),
      );
    return () => {
      alive = false;
    };
  }, [skipServer, serverClothId, focused]);

  const serverLoading = !skipServer && server.loading;
  const cards: Card[] = [
    ...(skipServer ? [] : server.items).map((item) => ({
      rental: toRental(item, currentUserId),
      name: item.borrowerNickname,
      sub: '-',
      clothTitle: item.clothingTitle,
      hours: hoursUntil(item.expiresAt),
      fromServer: true,
    })),
    ...requests.map((rental) => {
      const borrower = findDemoUser(rental.borrowerId);
      return {
        rental,
        name: borrower?.name ?? '신청자',
        sub: borrower?.region.district ?? '-',
        clothTitle: clothes.find((item) => item.id === rental.clothId)?.title ?? '-',
        hours: hoursLeft(rental),
        fromServer: false,
      };
    }),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header type="back" title="받은 신청" onPressLeft={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {cloth && (
          <>
            <ItemSummary
              title={cloth.title}
              price={cloth.price}
              ownerNickname=""
              region={cloth.region}
              imageUrl={cloth.imageUrl}
              meta={`${cloth.price.toLocaleString('ko-KR')}원 · 신청 ${cards.length}건`}
              divider={false}
            />
            <View style={styles.line} />
          </>
        )}

        {serverLoading && <Text style={styles.empty}>신청을 불러오고 있어요</Text>}
        {!!server.error && !skipServer && (
          <Text style={styles.empty}>서버 신청을 불러오지 못했어요. {server.error}</Text>
        )}
        {cards.length === 0 && !serverLoading && (
          <Text style={styles.empty}>아직 받은 신청이 없어요</Text>
        )}

        {groupOverlaps(cards).map((group) => (
          <View
            key={group
              .map(({ rental, fromServer }) => `${fromServer ? 'server' : 'mock'}-${rental.id}`)
              .join()}
            style={styles.group}
          >
            {group.map(({ rental, name, sub, clothTitle, hours, fromServer }) => (
              <Pressable
                key={rental.id}
                // 서버 신청은 수락, 거절 API 연동 전이라 보기 전용 거래 상세로 엽니다
                onPress={() =>
                  navigation.navigate(fromServer ? 'TradeDetail' : 'ReceivedRequestDetail', {
                    rentalId: rental.id,
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`${name}의 신청 자세히 보기`}
                style={styles.card}
              >
                <PersonRow
                  name={name}
                  sub={sub}
                  right={<Badge label={`${hours}시간 남음`} tone="alert" />}
                />
                {!cloth && <Row label="옷" value={clothTitle} />}
                <Row
                  label="날짜"
                  value={`${formatDate(new Date(rental.start))} ~ ${formatDate(new Date(rental.end))} · ${countDays(rental.start, rental.end)}일`}
                />
                <Row label="거래방식" value={rental.method} />
                <View style={styles.more}>
                  <Text style={styles.moreText}>자세히 보기</Text>
                  <Image
                    source={require('../../../assets/icons/chevron-right.png')}
                    style={styles.moreIcon}
                    resizeMode="contain"
                  />
                </View>
              </Pressable>
            ))}

            {/* 기간이 겹치는 신청은 모아 두고 안내는 묶음 아래에 한 번만 보여 줍니다 */}
            {group.length > 1 && (
              <View style={styles.note}>
                <Image
                  source={require('../../../assets/icons/info.png')}
                  style={styles.noteIcon}
                  resizeMode="contain"
                />
                <Text style={styles.noteText}>
                  신청과 기간이 겹쳐요. 하나를 수락하면 다른 신청은 자동으로 무효돼요
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// 같은 옷에서 기간이 겹치는 신청끼리 묶습니다. 한 신청이 여러 묶음과 겹치면 그 묶음들을 합칩니다
function groupOverlaps(cards: Card[]): Card[][] {
  let groups: Card[][] = [];
  for (const card of cards) {
    const hits = groups.filter((group) =>
      group.some(
        (other) =>
          other.fromServer === card.fromServer &&
          other.rental.clothId === card.rental.clothId &&
          overlaps(other.rental, card.rental),
      ),
    );
    const at = hits.length ? groups.indexOf(hits[0]) : groups.length;
    const rest = (list: Card[][]) => list.filter((group) => !hits.includes(group));
    groups = [...rest(groups.slice(0, at)), [...hits.flat(), card], ...rest(groups.slice(at))];
  }
  return groups;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  body: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },

  line: {
    height: 1,
    backgroundColor: COLORS.line,
  },

  empty: {
    paddingVertical: 40,
    textAlign: 'center',
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  group: {
    gap: 12,
  },

  card: {
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  rowLabel: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.text,
    includeFontPadding: false,
  },

  rowValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  more: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  moreText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.primary,
    includeFontPadding: false,
  },

  moreIcon: {
    width: 16,
    height: 16,
    tintColor: COLORS.primary,
  },

  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bgGray,
  },

  noteIcon: {
    width: 16,
    height: 16,
    marginTop: 1,
    tintColor: COLORS.textSub,
  },

  noteText: {
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18.85,
    color: COLORS.textSub,
    includeFontPadding: false,
  },
});
