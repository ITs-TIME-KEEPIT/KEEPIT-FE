import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import AreaInputField from '../../components/common/AreaInputField';
import CtaButton from '../../components/common/CtaButton';
import CtaDisabledButton from '../../components/common/CtaDisabledButton';
import Header from '../../components/common/Header';
import RadioInputField from '../../components/common/RadioInputField';
import InfoNote from '../../components/rental/InfoNote';
import { COLORS } from '../../constants/colors';
import { reportRental } from '../../state/rentalStore';

type Props = NativeStackScreenProps<RootStackParamList, 'TradeReport'>;

const REASONS = [
  '얼룩·오염 (세탁으로 지워질 것 같아요)',
  '수선이 필요해요 (작은 구멍, 안 지워지는 얼룩)',
  '입을 수 없어요 (찢어짐, 탈색)',
  '반납이 늦어지고 있어요',
  '옷을 받지 못했어요 (노쇼)',
  '기타',
] as const;
const ETC = REASONS[5];

/* TRD-580 문제 신고. 접수 후 판단은 운영자가 합니다 */
export default function TradeReportScreen({ navigation, route }: Props) {
  const [reason, setReason] = useState<(typeof REASONS)[number] | null>(null);
  const [detail, setDetail] = useState('');
  const scrollRef = useRef<ScrollViewInstance>(null);

  // 입력칸이 본문 맨 아래라, 키보드가 열리면 끝까지 스크롤해 입력칸 전체를 보여줌
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => scrollRef.current?.scrollToEnd());
    return () => sub.remove();
  }, []);

  const text = detail.trim();
  const canSubmit = !!reason && (reason !== ETC || !!text);

  const submit = () => {
    try {
      reportRental(route.params.rentalId, reason === ETC ? `${reason}: ${text}` : reason!);
      Alert.alert('신고를 접수했어요', '운영자가 사진을 확인하고 양쪽에 결과를 알려드려요.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('문제 신고', error instanceof Error ? error.message : '다시 시도해주세요.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header type="back" title="문제 신고" onPressLeft={() => navigation.goBack()} />

      {/* Figma: 키보드가 열리면 하단 버튼은 키보드 뒤에 두고, 본문만 스크롤해 입력칸을 보여줌 */}
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            어떤 문제인가요? <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.options}>
            {REASONS.filter((item) => item !== ETC).map((item) => (
              <RadioInputField
                key={item}
                label={item}
                selected={reason === item}
                onPress={() => setReason(item)}
              />
            ))}
            <View style={styles.etc}>
              <RadioInputField
                label={ETC}
                selected={reason === ETC}
                onPress={() => setReason(ETC)}
              />
              {/* '기타'를 골라야만 입력 가능 */}
              <AreaInputField
                label=""
                placeholder="어디에 어떤 문제가 있는지 적어주세요"
                value={detail}
                onChangeText={setDetail}
                editable={reason === ETC}
                maxLength={500}
              />
            </View>
          </View>

          <InfoNote text="운영자가 1~4단계 사진을 비교해서 확인하고 양쪽에 결과를 알려드려요 (11/7 데모는 운영자 수동 처리)" />
        </ScrollView>

        <View style={styles.bottomCta}>
          {canSubmit ? (
            <CtaButton title="신고하기" onPress={submit} />
          ) : (
            <CtaDisabledButton title="신고하기" />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  body: {
    gap: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  title: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    lineHeight: 23.2,
    color: COLORS.text,
    includeFontPadding: false,
  },

  required: {
    color: COLORS.alert,
  },

  options: {
    gap: 20,
  },

  // Figma: '기타'와 입력칸 사이 12
  etc: {
    gap: 12,
  },

  bottomCta: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
