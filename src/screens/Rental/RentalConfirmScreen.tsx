import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import { COLORS } from '../../constants/colors';
import { MOCK_RENTAL_CLOTH } from '../../mocks/rental';
import { formatDate, formatMonthDay } from '../../utils/formatDate';

import Header from '../../components/common/Header';
import CheckInputField from '../../components/common/CheckInputField';
import CheckOnInputField from '../../components/common/CheckOnInputField';
import CtaButton from '../../components/common/CtaButton';
import CtaDisabledButton from '../../components/common/CtaDisabledButton';
import ItemSummary from '../../components/rental/ItemSummary';
import InfoRow from '../../components/rental/InfoRow';

type Props = NativeStackScreenProps<RootStackParamList, 'RentalConfirm'>;

export default function RentalConfirmScreen({ navigation, route }: Props) {
  const { start, end, method } = route.params;
  // shortcut: 옷 상세 연동 전이라 시연용 옷을 표시, 상세 연동 시 clothId로 조회
  const cloth = MOCK_RENTAL_CLOTH;

  const laundryWho = cloth.laundryByRenter ? '빌린 사람' : '등록자';
  const rules = [
    '옷을 수선하거나 변형하지 않을게요',
    '돌려주는 날까지 반납할게요',
    `세탁 방법(${laundryWho} 세탁)을 확인했어요`,
  ];
  const [agreed, setAgreed] = useState(rules.map(() => false));
  const allAgreed = agreed.every(Boolean);

  // 전체 동의는 하위 항목에서 계산 -> 하위 3개가 모두 체크되면 자동 체크, 하나라도 풀리면 자동 해제
  const toggleAll = () => setAgreed(rules.map(() => !allAgreed));
  const toggle = (index: number) =>
    setAgreed((prev) => prev.map((v, i) => (i === index ? !v : v)));

  const isDirect = method === '직거래';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header type="back" title="신청 확인" onPressLeft={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <ItemSummary
          title={cloth.title}
          price={cloth.price}
          ownerNickname={cloth.ownerNickname}
          region={cloth.region}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>신청 내용</Text>
          <View style={styles.rows}>
            <InfoRow
              label="기간"
              value={`${formatDate(new Date(start))} ~ ${formatDate(new Date(end))}`}
            />
            <InfoRow label="거래 방식" value={isDirect ? `직거래 · ${cloth.region}` : '택배'} />
            <InfoRow
              label="세탁"
              value={cloth.laundryByRenter ? '빌린 사람이 세탁해서 돌려줘요' : '등록자가 세탁해요'}
            />
            <InfoRow
              label="대여 가능 기간"
              value={`${formatMonthDay(cloth.availableFrom)} ~ ${formatMonthDay(cloth.availableTo)}`}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>예상 비용</Text>
          <View style={styles.divider} />
          <View style={styles.rows}>
            <InfoRow label="대여료" value={`${cloth.price.toLocaleString('ko-KR')}원`} />
            {/* shortcut: 시연은 직거래 기준이라 택배비 계산은 생략, 택배 연동 시 편도 택배비 표시 */}
            <InfoRow label="택배비" value={isDirect ? '0원 (직거래)' : '등록자와 협의'} />
            <InfoRow label="세탁" value={cloth.laundryByRenter ? '직접 세탁' : '등록자 세탁'} />
            <InfoRow
              label="총 예상 비용"
              value={`${cloth.price.toLocaleString('ko-KR')}원`}
              highlight
            />
          </View>
        </View>

        <View style={styles.agreeSection}>
          <Text style={styles.agreeTitle}>이용 규칙 동의</Text>

          <View style={styles.agreeBox}>
            {allAgreed ? (
              <CheckOnInputField label="전체 동의" onPress={toggleAll} />
            ) : (
              <CheckInputField label="전체 동의" onPress={toggleAll} />
            )}

            <View style={styles.agreeDivider} />

            {rules.map((rule, index) =>
              agreed[index] ? (
                <CheckOnInputField key={rule} label={rule} onPress={() => toggle(index)} />
              ) : (
                <CheckInputField key={rule} label={rule} onPress={() => toggle(index)} />
              ),
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomCta}>
        {allAgreed ? (
          // TODO: 신청 상태 저장(공유 상태 저장소) 연동 후 신청 생성
          <CtaButton title="신청하기" onPress={() => navigation.navigate('RentalComplete')} />
        ) : (
          <CtaDisabledButton title="신청하기" />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  scrollView: {
    flex: 1,
  },

  body: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },

  infoBox: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 20,
  },

  infoTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    lineHeight: 21.75,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.bgLight,
  },

  rows: {
    gap: 16,
  },

  agreeSection: {
    gap: 20,
  },

  agreeTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    lineHeight: 23.2,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  agreeBox: {
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.bgGray,
    borderRadius: 8,
  },

  agreeDivider: {
    height: 1,
    backgroundColor: COLORS.bgGray,
  },

  bottomCta: {
    width: '100%',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.white,
  },
});
