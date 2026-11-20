import React, { useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, Pressable, ScrollView, StyleSheet, Keyboard } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { COLORS } from '../../constants/colors';

import Header from '../../components/common/Header';
import Popup from '../../components/common/Popup';
import CtaButton from '../../components/common/CtaButton';
import RadioInputField from '../../components/common/RadioInputField';
import CheckInputField from '../../components/common/CheckInputField';
import CheckOnInputField from '../../components/common/CheckOnInputField';
import AreaInputField from '../../components/common/AreaInputField';

import { useClothingItems } from '../../state/clothingStore';
import { findDemoUser, useRentalState } from '../../state/rentalStore';
import { ACTIVE_STAGES } from '../../utils/myClothes';

const ETC = '기타';
const REASONS = ['원하는 옷이 없어요', '거래 과정이 번거로워요', '다른 서비스를 써요', ETC];
const AGREE_LABEL = '안내를 모두 확인했고 탈퇴에 동의해요';

/* 회원 탈퇴 (Figma F. 회원 탈퇴) */
export default function WithdrawScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Withdraw'>) {
  const { currentUserId, rentals } = useRentalState();
  const clothes = useClothingItems();
  const me = findDemoUser(currentUserId);
  const [reason, setReason] = useState<string | null>(null);
  const [detail, setDetail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const scrollRef = useRef<ScrollViewInstance>(null);

  // 입력칸이 본문 맨 아래라, 키보드가 열리면 끝까지 스크롤해 입력칸 전체를 보여줌
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => scrollRef.current?.scrollToEnd());
    return () => sub.remove();
  }, []);

  const mine = rentals.filter(
    (rental) => rental.ownerId === currentUserId || rental.borrowerId === currentUserId,
  );
  const clothCount = clothes.filter(
    (cloth) => cloth.ownerId === currentUserId && !cloth.deleted,
  ).length;
  const lostInfo = [
    { label: '닉네임', value: me?.name ?? '-' },
    { label: '등록한 옷', value: `${clothCount}벌 · 사진 기록 포함` },
    {
      label: '완료된 거래 내역',
      value: `${mine.filter((rental) => rental.stage === 'completed').length}건`,
    },
  ];

  const withdraw = () => {
    if (mine.some((rental) => ACTIVE_STAGES.includes(rental.stage))) {
      setBlockedOpen(true);
      return;
    }
    // TODO: 회원 탈퇴 API 연동 (사유 reason · detail 함께 전송) 후 저장된 로그인 정보 삭제
    navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header type="back" title="회원 탈퇴" onPressLeft={() => navigation.goBack()} />

      {/* Figma: 키보드가 열리면 하단 버튼은 키보드 뒤에 두고, 본문만 스크롤해 입력칸을 보여줌 */}
      <View style={styles.flex}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.intro}>
            <Text style={styles.title}>정말 탈퇴하시겠어요?</Text>
            <Text style={styles.description}>
              탈퇴하면 아래 정보가 모두 사라지고 되돌릴 수 없어요
            </Text>
          </View>

          <View style={styles.lostInfo}>
            {lostInfo.map((row) => (
              <View key={row.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.reasons}>
            <Text style={styles.reasonTitle}>떠나는 이유를 알려주세요 (선택)</Text>
            {REASONS.map((label) => (
              <RadioInputField
                key={label}
                label={label}
                selected={reason === label}
                onPress={() => setReason(label)}
              />
            ))}
            <AreaInputField
              label=""
              placeholder="어떤 점이 아쉬우셨나요? 보내주신 의견은 서비스 개선에 반영할 예정이에요."
              value={detail}
              onChangeText={setDetail}
              editable={reason === ETC}
              maxLength={500}
            />
          </View>
        </ScrollView>

        <View style={styles.bottomCta}>
          {agreed ? (
            <CheckOnInputField label={AGREE_LABEL} onPress={() => setAgreed(false)} />
          ) : (
            <CheckInputField label={AGREE_LABEL} onPress={() => setAgreed(true)} />
          )}
          <View style={styles.buttons}>
            <CtaButton title="계속 이용할게요" onPress={() => navigation.goBack()} />
            <Pressable
              onPress={withdraw}
              disabled={!agreed}
              accessibilityRole="button"
              accessibilityState={{ disabled: !agreed }}
              hitSlop={8}
              style={styles.withdrawButton}
            >
              <Text style={[styles.withdrawText, !agreed && styles.withdrawTextDisabled]}>
                탈퇴하기
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Popup
        visible={blockedOpen}
        title="아직 진행 중인 거래가 있어요"
        description={
          '진행 중인 대여 거래가 있으면 탈퇴할 수 없어요.\n거래를 먼저 완료한 후 다시 시도해 주세요.'
        }
        primaryLabel="확인했어요"
        onPressPrimary={() => setBlockedOpen(false)}
        onClose={() => setBlockedOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  flex: {
    flex: 1,
  },

  body: {
    gap: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  intro: {
    alignItems: 'center',
    gap: 8,
  },

  title: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    lineHeight: 26.1,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  description: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.textSub,
    textAlign: 'center',
    includeFontPadding: false,
  },

  lostInfo: {
    gap: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  infoLabel: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  infoValue: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  reasons: {
    gap: 12,
  },

  reasonTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  bottomCta: {
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.white,
  },

  buttons: {
    gap: 8,
  },

  withdrawButton: {
    alignSelf: 'center',
    paddingTop: 4,
  },

  withdrawText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    lineHeight: 23.2,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  withdrawTextDisabled: {
    color: COLORS.textPlaceholder,
  },
});
