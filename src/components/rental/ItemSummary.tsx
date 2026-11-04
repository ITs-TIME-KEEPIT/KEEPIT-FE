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
  imageUrl?: string;
  meta?: string; // 기본 '대여료 · 등록자 · 지역' 대신 보여줄 부가 정보
  divider?: boolean;
}

/* 대여 신청·신청 확인 상단의 옷 요약 */
export default function ItemSummary({
  title,
  price,
  ownerNickname,
  region,
  imageUrl,
  meta,
  divider = true,
}: ItemSummaryProps) {
  return (
    <View style={[styles.container, divider && styles.divider]}>
      <SquareImage size={56} source={imageUrl ? { uri: imageUrl } : undefined} />

      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta ?? `${price.toLocaleString('ko-KR')}원 · ${ownerNickname} · ${region}`}
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
  },

  divider: {
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
