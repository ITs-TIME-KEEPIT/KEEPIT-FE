import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import CtaButton from '../../components/common/CtaButton';
import Header from '../../components/common/Header';
import SquareImage from '../../components/common/SquareImage';
import InfoRow from '../../components/rental/InfoRow';
import { COLORS } from '../../constants/colors';
import { useClothingItems } from '../../state/clothingStore';
import { findDemoUser, useRentalState } from '../../state/rentalStore';
import { formatDate, rentalDays } from '../../utils/formatDate';

type Props = NativeStackScreenProps<RootStackParamList, 'TradeComplete'>;

const PHONE_HIDDEN_AFTER = 7 * 24 * 60 * 60 * 1000;

/* TRD-540 결과. 등록자·대여자가 같은 화면에서 문구만 다르게 봅니다 */
export default function TradeCompleteScreen({ navigation, route }: Props) {
  const { currentUserId, rentals } = useRentalState();
  const clothes = useClothingItems();

  const rental = rentals.find((item) => item.id === route.params.rentalId);
  const cloth = clothes.find((item) => item.id === rental?.clothId);
  const isOwner = rental?.ownerId === currentUserId;

  // 등록자는 빌려준 옷 탭, 대여자는 빌린 옷 탭에서 결과를 확인합니다.
  const close = () => navigation.reset({
    index: 0,
    routes: [{ name: 'Main', params: { screen: 'MyTrades', params: { tab: isOwner ? '빌려준 옷' : '빌린 옷' } } }],
  });

  if (!rental || !cloth) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header type="close" onPressLeft={close} />
        <Text style={styles.empty}>거래를 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }

  const start = new Date(rental.start);
  const end = new Date(rental.end);
  const partner = findDemoUser(isOwner ? rental.borrowerId : rental.ownerId);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header type="close" onPressLeft={close} />

      <View style={styles.body}>
        <Image source={require('../../../assets/icons/trade-complete-hero.svg')} style={styles.hero} contentFit="contain" />
        <Text style={styles.title}>거래가 끝났어요!</Text>
        <Text style={styles.description}>
          {isOwner ? '옷을 잘 돌려받았어요.' : '옷을 잘 돌려줬어요.'} 킵잇을 이용해 줘서 고마워요.
        </Text>

        <View style={styles.summary}>
          <View style={styles.item}>
            <SquareImage size={48} source={cloth.imageUrl ? { uri: cloth.imageUrl } : undefined} />
            <View style={styles.itemTexts}>
              <Text style={styles.itemTitle} numberOfLines={1}>{cloth.title}</Text>
              <Text style={styles.itemSub} numberOfLines={1}>{partner?.name ?? (isOwner ? '대여자' : '등록자')} 님과의 거래</Text>
            </View>
          </View>
          <View style={styles.line} />
          <InfoRow label="대여 기간" value={`${formatDate(start)} ~ ${formatDate(end)} · ${rentalDays(start, end)}일`} />
          <InfoRow label="거래 방식" value={rental.method} />
          <InfoRow label={isOwner ? '받은 대여료' : '낸 대여료'} value={`${cloth.price.toLocaleString('ko-KR')}원`} />
        </View>

        {!!rental.completedAt && (
          <Text style={styles.phoneNotice}>
            상대방 번호는 {formatDate(new Date(rental.completedAt + PHONE_HIDDEN_AFTER))}에 다시 숨겨져요
          </Text>
        )}
      </View>

      <View style={styles.bottomCta}>
        <CtaButton title="확인" onPress={close} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  empty: {
    padding: 20,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  body: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
    paddingTop: 36,
    paddingHorizontal: 20,
  },

  hero: {
    width: 220,
    height: 160,
  },

  title: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 22,
    color: COLORS.text,
    includeFontPadding: false,
  },

  description: {
    marginBottom: 12,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  summary: {
    width: '100%',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.bgLight,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  itemTexts: {
    flex: 1,
    gap: 2,
  },

  itemTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    color: COLORS.text,
    includeFontPadding: false,
  },

  itemSub: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  line: {
    height: 1,
    backgroundColor: COLORS.line,
  },

  phoneNotice: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    textAlign: 'center',
    color: COLORS.textPlaceholder,
    includeFontPadding: false,
  },

  bottomCta: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.white,
  },
});
