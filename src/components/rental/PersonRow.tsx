import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

import RoundImage from '../common/RoundImage';

interface PersonRowProps {
  name: string;
  sub: string;
  right?: React.ReactNode; // 남은 시간 뱃지, 문자하기 버튼 등
}

/* 신청자·거래 상대 한 줄 (프로필 원 · 이름 · 보조 정보) */
export default function PersonRow({
  name,
  sub,
  right,
}: PersonRowProps) {
  return (
    <View style={styles.container}>
      <RoundImage size={40} />
      <View style={styles.texts}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  texts: {
    flex: 1,
  },

  name: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    lineHeight: 21.75,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  sub: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18.85,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },
});
