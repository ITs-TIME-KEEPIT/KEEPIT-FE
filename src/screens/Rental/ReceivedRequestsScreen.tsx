import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import { COLORS } from '../../constants/colors';
import { useClothingItems } from '../../state/clothingStore';
import { findDemoUser, hoursLeft, overlaps, useRentalState } from '../../state/rentalStore';
import { formatDate } from '../../utils/formatDate';

import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import ItemSummary from '../../components/rental/ItemSummary';
import PersonRow from '../../components/rental/PersonRow';

type Props = NativeStackScreenProps<RootStackParamList, 'ReceivedRequests'>;

const countDays = (start: number, end: number) => Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1;

/* 받은 신청 목록. clothId가 있으면 그 옷의 신청만, 없으면(마이에서 진입) 내 옷 전체 */
export default function ReceivedRequestsScreen({ navigation, route }: Props) {
  const clothId = route.params?.clothId;
  const clothes = useClothingItems();
  const { currentUserId, rentals } = useRentalState();

  const requests = rentals.filter(
    (rental) => rental.ownerId === currentUserId && rental.stage === 'requested' && (!clothId || rental.clothId === clothId),
  );
  const cloth = clothId ? clothes.find((item) => item.id === clothId) : undefined;

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
              meta={`${cloth.price.toLocaleString('ko-KR')}원 · 신청 ${requests.length}건`}
              divider={false}
            />
            <View style={styles.line} />
          </>
        )}

        {requests.length === 0 && <Text style={styles.empty}>아직 받은 신청이 없어요</Text>}

        {requests.map((rental) => {
          const borrower = findDemoUser(rental.borrowerId);
          const title = clothes.find((item) => item.id === rental.clothId)?.title ?? '-';
          const hasOverlap = requests.some(
            (other) => other.id !== rental.id && other.clothId === rental.clothId && overlaps(other, rental),
          );

          return (
            <View key={rental.id} style={styles.group}>
              <Pressable
                onPress={() => navigation.navigate('ReceivedRequestDetail', { rentalId: rental.id })}
                accessibilityRole="button"
                accessibilityLabel={`${borrower?.name ?? '신청자'}의 신청 자세히 보기`}
                style={styles.card}
              >
                <PersonRow
                  name={borrower?.name ?? '신청자'}
                  sub={borrower?.region.district ?? '-'}
                  right={<Badge label={`${hoursLeft(rental)}시간 남음`} tone="alert" />}
                />
                {!cloth && <Row label="옷" value={title} />}
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

              {hasOverlap && (
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
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
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
