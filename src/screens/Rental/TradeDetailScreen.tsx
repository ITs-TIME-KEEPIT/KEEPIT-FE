import React, { useState } from 'react';
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
import { useIsFocused } from '@react-navigation/native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import { COLORS } from '../../constants/colors';
import { DEMO_PHONES } from '../../mocks/rental';
import { useClothingItems } from '../../state/clothingStore';
import { cancelRental, completeRental, findDemoUser, hoursLeft, markLaundryNoticeSeen, useRentalState } from '../../state/rentalStore';
import type { Rental } from '../../types/rental';
import { formatDate, formatDday } from '../../utils/formatDate';
import { STAGE_STEP } from '../../utils/tradeStage';

import Header from '../../components/common/Header';
import TradeStepper from '../../components/common/TradeStepper';
import CtaButton from '../../components/common/CtaButton';
import DefaultButton from '../../components/common/DefaultButton';
import { nextPhotoCheckpoint } from '../../state/tradePhotoStore';
import CancelReasonSheet from '../../components/rental/CancelReasonSheet';
import InfoNote from '../../components/rental/InfoNote';
import InfoRow from '../../components/rental/InfoRow';
import ItemSummary from '../../components/rental/ItemSummary';
import LaundryNoticePopup from '../../components/rental/LaundryNoticePopup';
import PersonRow from '../../components/rental/PersonRow';

type Props = NativeStackScreenProps<RootStackParamList, 'TradeDetail'>;

const PHOTO_BUTTONS = { handoff: '전달 전 사진 찍기', receipt: '수령 확인 사진 찍기', return: '반납 사진 찍기' } as const;

const TODO = '다음에 할 일';
const WAITING = '진행 중';

// 공통 촬영 진입과 같은 단계·역할을 사용합니다.
function nextAction(rental: Rental, isOwner: boolean, borrowerWashes: boolean): { label?: string; dday?: string; title: string; desc: string } {
  switch (rental.stage) {
    case 'requested':
      return isOwner
        ? { label: TODO, title: '신청을 확인하고 응답해주세요', desc: `${hoursLeft(rental)}시간 안에 수락하거나 거절해주세요.` }
        : { label: WAITING, title: '등록자의 수락을 기다리고 있어요', desc: '수락되면 서로의 연락처가 공개돼요.' };
    case 'accepted':
      return isOwner
        ? { label: TODO, title: '상대방에게 연락해서 거래를 진행해주세요', desc: `${rental.method === '직거래' ? '직거래 장소와 시간은' : '택배 주소와 보내는 날은'} 연락해서 정해주세요. 번호는 거래 완료 7일 뒤에 숨겨져요.` }
        : { label: WAITING, title: '등록자가 옷 상태를 찍고 건네줄 거예요', desc: '등록자가 전달 전 사진을 올리면 알림으로 알려드려요. 옷을 받으면 바로 수령 사진을 찍어주세요.' };
    case 'handed-over':
      return isOwner
        ? { label: WAITING, title: '빌린 사람이 받은 옷 상태를 확인하고 있어요', desc: '빌린 사람이 수령 사진을 올리면 알림으로 알려드려요.' }
        : { label: TODO, title: '받은 옷 상태를 바로 찍어주세요', desc: '수령 사진이 있어야 원래 있던 손상으로 청구되지 않아요.' };
    case 'received': {
      const due = formatDate(new Date(rental.end));
      const dday = formatDday(new Date(rental.end));
      return isOwner
        ? { label: WAITING, dday, title: `${due}에 돌려받아요`, desc: `빌린 사람이 ${borrowerWashes ? '세탁 후 ' : ''}반납 사진을 올리면 알림으로 알려드려요. 옷을 받으면 사진을 비교하고 거래를 완료해주세요.` }
        : { label: TODO, dday, title: `${due}까지 돌려주세요`, desc: borrowerWashes ? '빌린 사람이 세탁해서 돌려주는 옷이에요. 세탁 후 사진이 꼭 필요해요.' : '돌려주기 전 옷 상태를 사진으로 남겨주세요.' };
    }
    case 'returned':
      if (!isOwner) return { label: WAITING, title: '등록자가 돌려받은 옷을 확인하고 있어요', desc: '등록자가 완료를 누르면 거래가 끝나요. 문제가 접수되면 운영자가 4단계 사진을 보고 확인해요.' };
      return rental.photosReviewed
        ? { label: TODO, title: '옷에 이상이 없으면 거래 완료를 진행해 주세요.', desc: '비교 사진을 다시 보고 싶다면 다시 보기 버튼을 눌러주세요.' }
        : { label: TODO, title: '돌려받은 옷을 꼼꼼히 비교 후 확인해주세요', desc: '반납된 옷에 이상이 있다면 문제 신고를 눌러주세요. 운영자가 사진을 보고 확인해요.' };
    case 'completed':
      return { title: '거래가 끝났어요', desc: '' };
    case 'rejected':
      return { title: '거절된 신청이에요', desc: rental.rejectReason ?? '' };
    case 'cancelled':
      return { title: '취소된 거래예요', desc: rental.cancelReason ?? '' };
  }
}

/* 거래 상세 뼈대 */
export default function TradeDetailScreen({ navigation, route }: Props) {
  const { currentUserId, rentals } = useRentalState();
  const clothes = useClothingItems();
  // 촬영 화면 아래에 깔려 있을 때 팝업(Modal)이 위로 뜨지 않게 합니다.
  const focused = useIsFocused();
  const [handoffNoticeOpen, setHandoffNoticeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

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
  const contactOpen = !['requested', 'rejected', 'cancelled'].includes(rental.stage);
  const borrowerWashes = !cloth.laundryIncluded;
  const action = nextAction(rental, isOwner, borrowerWashes);
  const checkpoint = nextPhotoCheckpoint(rental, currentUserId);
  const seen = rental.laundryNoticeSeen ?? [];
  const defect = cloth.detail?.defect?.description;
  const showReturnInfo = rental.stage === 'received';
  const reviewing = isOwner && rental.stage === 'returned';

  const receiptNoticeDue = rental.stage === 'received' && !isOwner && borrowerWashes && !seen.includes('receipt');
  const notice = !focused ? null : handoffNoticeOpen ? 'handoff' : receiptNoticeDue ? 'receipt' : null;

  const openSms = (number: string) =>
    Linking.openURL(`sms:${number}`).catch(() => Alert.alert('연결할 수 없어요', '이 기기에서는 문자를 열 수 없어요.'));
  const goPhoto = () => navigation.navigate('TradePhoto', { rentalId: rental.id });
  const goCompare = () => navigation.navigate('TradePhotoCompare', { rentalId: rental.id });

  const pressPhoto = () => {
    if (checkpoint === 'handoff' && borrowerWashes && !seen.includes('handoff')) setHandoffNoticeOpen(true);
    else goPhoto();
  };

  const confirmNotice = () => {
    if (!notice) return;
    markLaundryNoticeSeen(rental.id, notice);
    if (notice === 'handoff') {
      setHandoffNoticeOpen(false);
      goPhoto();
    }
  };

  const cancel = (reason?: string) => {
    try {
      cancelRental(rental.id, reason);
      setCancelOpen(false);
    } catch (error) {
      Alert.alert('거래 취소', error instanceof Error ? error.message : '다시 시도해주세요.');
    }
  };

  const confirmCancelRequest = () => Alert.alert('신청을 취소할까요?', '등록자에게 보낸 신청이 사라져요.', [
    { text: '닫기', style: 'cancel' },
    { text: '신청 취소', style: 'destructive', onPress: () => cancel() },
  ]);

  const goReport = () => navigation.navigate('TradeReport', { rentalId: rental.id });

  const complete = () => {
    try {
      completeRental(rental.id);
      navigation.replace('TradeComplete', { rentalId: rental.id });
    } catch (error) {
      Alert.alert('거래 완료', error instanceof Error ? error.message : '다시 시도해주세요.');
    }
  };

  // 현재 계정과 단계에서 가능한 동작만 연결합니다. 상대 차례면 주요 버튼이 없습니다.
  const primary = checkpoint
    ? { title: PHOTO_BUTTONS[checkpoint], onPress: pressPhoto }
    : reviewing && rental.photosReviewed
      ? { title: '거래 완료', onPress: complete }
      : rental.stage === 'returned'
        ? { title: '사진 비교하기', onPress: goCompare }
        : null;
  const secondary = rental.stage === 'accepted'
    ? { title: '거래 취소', onPress: () => setCancelOpen(true) }
    : rental.stage === 'requested' && !isOwner
      ? { title: '신청 취소', onPress: confirmCancelRequest }
      : rental.stage === 'handed-over' && !isOwner
        ? { title: '문제 신고', onPress: goReport }
        : reviewing && rental.photosReviewed
          ? { title: '사진 다시 보기', onPress: goCompare }
          : null;

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
          {!!action.label && <Text style={styles.nextLabel}>{action.label}</Text>}
          <Text style={styles.nextTitle}>
            {!!action.dday && <Text style={styles.dday}>{action.dday} </Text>}
            {action.title}
          </Text>
          {!!action.desc && <Text style={styles.nextDesc}>{action.desc}</Text>}
        </View>

        {rental.stage === 'handed-over' && !!defect && (
          <InfoNote text={`등록 때 고지된 하자: ${defect}. ${isOwner ? '빌린 사람에게도 같은 내용이 보여요' : '그 밖의 하자가 보이면 수령 사진과 함께 신고해주세요'}`} />
        )}

        {!!rental.report && <InfoNote text="문제 신고가 접수됐어요. 운영자가 1~4단계 사진을 비교해서 확인하고 양쪽에 결과를 알려드려요" />}

        {showReturnInfo && (
          <View style={styles.returnInfo}>
            <InfoRow label="돌려받는 날" value={formatDate(new Date(rental.end))} highlight />
            <InfoRow label="세탁" value={borrowerWashes ? '빌린 사람이 세탁해서 돌려줘요' : '등록자가 세탁해요'} />
            <InfoRow label="반납 방법" value={`${rental.method} · ${cloth.region}`} />
          </View>
        )}

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

      {(primary || secondary) && (
        <View style={styles.bottomCta}>
          {primary && <CtaButton title={primary.title} onPress={primary.onPress} />}
          {secondary && (
            <View style={styles.secondary}>
              <DefaultButton title={secondary.title} onPress={secondary.onPress} />
            </View>
          )}
        </View>
      )}

      <CancelReasonSheet visible={cancelOpen} onCancel={cancel} onClose={() => setCancelOpen(false)} />

      {notice && (
        <LaundryNoticePopup
          notice={notice}
          dueDate={formatDate(new Date(rental.end))}
          onConfirm={confirmNotice}
          onPressSms={phone ? () => openSms(phone) : undefined}
          onClose={notice === 'handoff' ? () => setHandoffNoticeOpen(false) : confirmNotice}
        />
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

  dday: {
    color: COLORS.primary,
  },

  nextDesc: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  returnInfo: {
    gap: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
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
