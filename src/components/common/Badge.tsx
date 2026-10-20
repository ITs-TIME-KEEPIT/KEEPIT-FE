import React from 'react';
import {
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

export type BadgeTone = 'primary' | 'gray' | 'alert' | 'outline';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export default function Badge({
  label,
  tone = 'primary',
}: BadgeProps) {
  return (
    <Text style={[styles.badge, styles[tone]]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    overflow: 'hidden',

    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    lineHeight: 16.8,
    letterSpacing: 0,
    includeFontPadding: false,
  },

  primary: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
  },

  gray: {
    backgroundColor: COLORS.bgGray,
    color: COLORS.textSub,
  },

  alert: {
    backgroundColor: COLORS.alert,
    color: COLORS.white,
  },

  outline: {
    backgroundColor: COLORS.white,
    color: COLORS.textSub,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
});

/*
Badge 사용법 - 최종 배포 시 주석은 삭제 예정

import Badge from '../../components/common/Badge';

<Badge label="세탁 포함" /> -> 기본 색상 뱃지 (PrimaryLight 배경, Primary 글자색)
<Badge label="택배 가능" tone="gray" /> -> 회색 뱃지
<Badge label="NEW" tone="alert" /> -> 빨간 뱃지
<Badge label="대여중" tone="outline" /> -> 흰색 뱃지, 테두리 있음
*/