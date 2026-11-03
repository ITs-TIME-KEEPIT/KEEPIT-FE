import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean; // 총 예상 비용처럼 값을 파란색으로 강조
}

/* 왼쪽 라벨 · 오른쪽 값 한 줄 (기간, 거래 방식, 비용 등) */
export default function InfoRow({
  label,
  value,
  highlight = false,
}: InfoRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {label}
      </Text>
      <Text style={[styles.value, highlight && styles.valueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  label: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  value: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  valueHighlight: {
    color: COLORS.primary,
  },
});
