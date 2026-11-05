import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import { COLORS } from '../../constants/colors';
import { DEMO_PHONES } from '../../mocks/rental';
import { useClothingItems } from '../../state/clothingStore';
import { findDemoUser, hoursLeft, useRentalState } from '../../state/rentalStore';
import type { Rental } from '../../types/rental';
import { formatDate } from '../../utils/formatDate';
import { STAGE_STEP } from '../../utils/tradeStage';

import Header from '../../components/common/Header';
import TradeStepper from '../../components/common/TradeStepper';
import CtaButton from '../../components/common/CtaButton';
import DefaultButton from '../../components/common/DefaultButton';
import ItemSummary from '../../components/rental/ItemSummary';
import PersonRow from '../../components/rental/PersonRow';

type Props = NativeStackScreenProps<RootStackParamList, 'TradeDetail'>;

const preparing = () => Alert.alert('준비 중', '다음 작업에서 연결할 예정이에요.');

// TODO: 단계·역할별 '다음에 할 일'. 수락 이후 단계의 역할별 문구·버튼
function nextAction(rental: Rental, isOwner: boolean) {
  switch (rental.stage) {
    case 'requested':
      return isOwner
        ? { title: '신청을 확인하고 응답해주세요', desc: `${hoursLeft(rental)}시간 안에 수락하거나 거절해주세요.` }
        : { title: '등록자의 수락을 기다리고 있어요', desc: '수락되면 서로의 연락처가 공개돼요.' };
    case 'accepted':
      return { title: '상대방에게 연락해서 거래를 진행해주세요', desc: '직거래 장소와 시간은 연락해서 정해주세요. 번호는 거래 완료 7일 뒤에 숨겨져요.' };
    case 'rejected':
      return { title: '거절된 신청이에요', desc: rental.rejectReason ?? '' };
    default:
      return { title: '거래가 진행 중이에요', desc: '' };
  }
}

/* 거래 상세 뼈대 */
export default function TradeDetailScreen({ navigation, route }: Props) {
  const { currentUserId, rentals } = useRentalState();
  const clothes = useClothingItems();

  const rental = rentals.find((item) => item.id === route.params.rentalId);
  const cloth = clothes.find((item) => item.id === rental?.clothId);

  if (!rental || !cloth) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header type="back" title="거래 상세" onPressLeft={() => navigation.goBack()} />
        <Text style={styles.empty}>거래를 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }

  const isOwner = rental.ownerId === currentUserId;
  const partnerId = isOwner ? rental.borrowerId : rental.ownerId;
  const partner = findDemoUser(partnerId);
  const phone = DEMO_PHONES[partnerId];
  // 수락 후에만 서로 번호 공개
  const contactOpen = rental.stage !== 'requested' && rental.stage !== 'rejected';
  const action = nextAction(rental, isOwner);

  const openSms = (number: string) =>
    Linking.openURL(`sms:${number}`).catch(() => Alert.alert('연결할 수 없어요', '이 기기에서는 문자를 열 수 없어요.'));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header type="back" title="거래 상세" onPressLeft={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <ItemSummary
            title={cloth.title}
            price={cloth.price}
            ownerNickname=""
            region={cloth.region}
            imageUrl={cloth.imageUrl}
            meta={`${formatDate(new Date(rental.start))} ~ ${formatDate(new Date(rental.end))} · ${rental.method}`}
            divider={false}
          />
          <TradeStepper current={STAGE_STEP[rental.stage]} />
        </View>

        <View style={styles.line} />

        <View style={styles.nextAction}>
          <Text style={styles.nextLabel}>다음에 할 일</Text>
          <Text style={styles.nextTitle}>{action.title}</Text>
          {!!action.desc && <Text style={styles.nextDesc}>{action.desc}</Text>}
        </View>

        {contactOpen && (
          <View style={styles.contact}>
            <PersonRow
              name={partner?.name ?? (isOwner ? '대여자' : '등록자')}
              sub={phone ?? '-'}
              right={
                phone && (
                  <Pressable onPress={() => openSms(phone)} accessibilityRole="button" style={styles.contactButton}>
                    <Text style={styles.contactButtonText}>문자하기</Text>
                  </Pressable>
                )
              }
            />
          </View>
        )}
      </ScrollView>

      {/* 등록자만 전달 전 촬영으로 진행, 대여자는 대기. TODO: 촬영 연결 */}
      {rental.stage === 'accepted' && (
        <View style={styles.bottomCta}>
          {isOwner && <CtaButton title="전달 전 사진 찍기" onPress={preparing} />}
          <View style={styles.secondary}>
            <DefaultButton title="거래 취소" onPress={preparing} />
          </View>
        </View>
      )}
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

  top: {
    gap: 20,
  },

  line: {
    height: 1,
    marginTop: -8,
    backgroundColor: COLORS.line,
  },

  nextAction: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 8,
  },

  nextLabel: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    lineHeight: 21.75,
    color: COLORS.primary,
    includeFontPadding: false,
  },

  nextTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    lineHeight: 26.1,
    color: COLORS.text,
    includeFontPadding: false,
  },

  nextDesc: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  contact: {
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
  },

  contactButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.bgGray,
  },

  contactButtonText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.text,
    includeFontPadding: false,
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
