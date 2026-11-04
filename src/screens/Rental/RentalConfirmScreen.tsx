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
import { DEMO_IDS } from '../../mocks/demoScenario';
import { useClothingItems } from '../../state/clothingStore';
import { createRental } from '../../state/rentalStore';
import { formatDate } from '../../utils/formatDate';

import Header from '../../components/common/Header';
import CheckInputField from '../../components/common/CheckInputField';
import CheckOnInputField from '../../components/common/CheckOnInputField';
import CtaButton from '../../components/common/CtaButton';
import CtaDisabledButton from '../../components/common/CtaDisabledButton';
import ItemSummary from '../../components/rental/ItemSummary';
import InfoRow from '../../components/rental/InfoRow';

type Props = NativeStackScreenProps<RootStackParamList, 'RentalConfirm'>;

export default function RentalConfirmScreen({ navigation, route }: Props) {
  const { clothId, start, end, method } = route.params;
  const cloth = useClothingItems().find((item) => item.id === clothId);

  // laundryIncluded = 등록자가 세탁(대여료 포함). 아니면 빌린 사람이 세탁 후 반납
  const laundryByRenter = !cloth?.laundryIncluded;
  const laundryWho = laundryByRenter ? '빌린 사람' : '등록자';
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

  if (!cloth) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header type="back" title="신청 확인" onPressLeft={() => navigation.goBack()} />
        <Text style={styles.empty}>옷 정보를 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }

  const isDirect = method === '직거래';
  const shippingFee = isDirect ? 0 : cloth.detail?.shippingFee;
  const total = cloth.price + (shippingFee ?? 0);

  const submit = () => {
    // shortcut: 등록자 정보가 없는 기존 더미 옷은 시연 등록자(수빈) 옷으로 처리, API 연동 시 옷 응답의 등록자 사용
    createRental({ clothId: cloth.id, ownerId: cloth.ownerId ?? DEMO_IDS.owner, start, end, method });
    navigation.navigate('RentalComplete');
  };

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
          ownerNickname={cloth.detail?.ownerName ?? '등록자'}
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
              value={laundryByRenter ? '빌린 사람이 세탁해서 돌려줘요' : '등록자가 세탁해요'}
            />
            <InfoRow
              label="대여 가능 기간"
              value={cloth.detail?.availablePeriod ?? '-'}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>예상 비용</Text>
          <View style={styles.divider} />
          <View style={styles.rows}>
            <InfoRow label="대여료" value={`${cloth.price.toLocaleString('ko-KR')}원`} />
            <InfoRow
              label="택배비"
              value={isDirect ? '0원 (직거래)' : shippingFee !== undefined ? `${shippingFee.toLocaleString('ko-KR')}원 (편도)` : '-'}
            />
            <InfoRow label="세탁" value={laundryByRenter ? '직접 세탁' : '등록자 세탁'} />
            <InfoRow
              label="총 예상 비용"
              value={`${total.toLocaleString('ko-KR')}원`}
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
          <CtaButton title="신청하기" onPress={submit} />
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

  empty: {
    padding: 20,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.textSub,
    includeFontPadding: false,
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
