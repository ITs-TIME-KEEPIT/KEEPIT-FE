import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import { COLORS } from '../../constants/colors';
import { useClothingItems } from '../../state/clothingStore';
import { acceptRental, findDemoUser, hoursLeft, setRentalStage, useRentalState } from '../../state/rentalStore';
import { formatDate } from '../../utils/formatDate';

import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import CtaButton from '../../components/common/CtaButton';
import DefaultButton from '../../components/common/DefaultButton';
import Popup from '../../components/common/Popup';
import InfoRow from '../../components/rental/InfoRow';
import PersonRow from '../../components/rental/PersonRow';
import RejectReasonSheet from '../../components/rental/RejectReasonSheet';

type Props = NativeStackScreenProps<RootStackParamList, 'ReceivedRequestDetail'>;

/* RENT-420 · RENT-430 받은 신청 상세 · 수락 / 거절 */
export default function ReceivedRequestDetailScreen({ navigation, route }: Props) {
  const { rentals } = useRentalState();
  const clothes = useClothingItems();
  const [laundryPopupOpen, setLaundryPopupOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const rental = rentals.find((item) => item.id === route.params.rentalId);
  const cloth = clothes.find((item) => item.id === rental?.clothId);

  if (!rental || !cloth) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header type="back" title="신청 상세" onPressLeft={() => navigation.goBack()} />
        <Text style={styles.empty}>신청을 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }

  const borrower = findDemoUser(rental.borrowerId);
  const borrowerWashes = !cloth.laundryIncluded;
  const pending = rental.stage === 'requested';

  const accept = () => {
    try {
      acceptRental(rental.id);
      navigation.replace('TradeDetail', { rentalId: rental.id });
    } catch (error) {
      Alert.alert('신청 수락', error instanceof Error ? error.message : '다시 시도해주세요.');
    }
  };

  const reject = (reason: string) => {
    setRejectOpen(false);
    setRentalStage(rental.id, 'rejected', reason);
    Alert.alert('신청 거절', '거절 사유를 대여자에게 전달했어요.', [{ text: '확인', onPress: () => navigation.goBack() }]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header type="back" title="신청 상세" onPressLeft={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => Alert.alert('준비 중', '신청자 프로필은 이후 연결할 예정이에요.')}
          accessibilityRole="button"
          accessibilityLabel="신청자 프로필"
        >
          <PersonRow
            name={borrower?.name ?? '신청자'}
            sub={borrower?.region.district ?? '-'}
            right={
              <View style={styles.personRight}>
                {pending && <Badge label={`${hoursLeft(rental)}시간 남음`} tone="alert" />}
                <Image
                  source={require('../../../assets/icons/chevron-right.png')}
                  style={styles.chevron}
                  resizeMode="contain"
                />
              </View>
            }
          />
        </Pressable>

        <View style={styles.line} />

        <View style={styles.info}>
          <Text style={styles.infoTitle}>신청 내용</Text>
          <View style={styles.rows}>
            <InfoRow label="옷" value={cloth.title} />
            <InfoRow label="받는 날" value={formatDate(new Date(rental.start))} />
            <InfoRow label="돌려주는 날" value={formatDate(new Date(rental.end))} />
            <InfoRow label="거래 방식" value={rental.method === '직거래' ? `직거래 · ${cloth.region}` : '택배'} />
            <InfoRow label="세탁" value={borrowerWashes ? '빌린 사람이 세탁해서 돌려줘요' : '등록자가 세탁해요'} />
            <InfoRow label="대여료" value={`${cloth.price.toLocaleString('ko-KR')}원`} />
            {rental.stage === 'rejected' && <InfoRow label="거절 사유" value={rental.rejectReason ?? '-'} />}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomCta}>
        {pending ? (
          <>
            <CtaButton
              title="수락하기"
              onPress={() => (borrowerWashes ? setLaundryPopupOpen(true) : accept())}
            />
            <View style={styles.secondary}>
              <DefaultButton title="거절하기" onPress={() => setRejectOpen(true)} />
            </View>
          </>
        ) : rental.stage !== 'rejected' ? (
          <CtaButton title="거래 상세 보기" onPress={() => navigation.replace('TradeDetail', { rentalId: rental.id })} />
        ) : null}
      </View>

      {/* 시나리오 ④ 세탁 방식 재고지 후 수락 */}
      <Popup
        visible={laundryPopupOpen}
        title="세탁 방법을 다시 확인해 주세요"
        description={'빌린 사람이 드라이클리닝 후 돌려주는 거래예요.\n특별한 세탁 방법이 있다면 수락 후 연락할 때 꼭 알려주세요.'}
        primaryLabel="확인하고 수락할게요"
        onPressPrimary={() => {
          setLaundryPopupOpen(false);
          accept();
        }}
        secondaryLabel="다시 볼게요"
        onPressSecondary={() => setLaundryPopupOpen(false)}
        onClose={() => setLaundryPopupOpen(false)}
      />

      <RejectReasonSheet visible={rejectOpen} onReject={reject} onClose={() => setRejectOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  body: {
    padding: 20,
    gap: 20,
  },

  empty: {
    padding: 20,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  personRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  chevron: {
    width: 20,
    height: 20,
    tintColor: COLORS.text,
  },

  line: {
    height: 1,
    backgroundColor: COLORS.line,
  },

  info: {
    paddingHorizontal: 4,
    gap: 20,
  },

  infoTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    lineHeight: 23.2,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  rows: {
    gap: 16,
  },

  bottomCta: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 8,
    backgroundColor: COLORS.white,
  },

  // DefaultButton이 alignSelf: 'flex-start'라 가로 정렬로 가운데 배치
  secondary: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 4,
  },
});
