import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

import SquareImage from '../common/SquareImage';

interface ItemSummaryProps {
  title: string;
  price: number;
  ownerNickname: string;
  region: string;
}

/* 대여 신청·신청 확인 상단의 옷 요약 */
export default function ItemSummary({
  title,
  price,
  ownerNickname,
  region,
}: ItemSummaryProps) {
  return (
    <View style={styles.container}>
      <SquareImage size={56} />

      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {price.toLocaleString('ko-KR')}원 · {ownerNickname} · {region}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgGray,
  },

  texts: {
    flex: 1,
    gap: 2,
  },

  title: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    lineHeight: 23.2,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  meta: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },
});
