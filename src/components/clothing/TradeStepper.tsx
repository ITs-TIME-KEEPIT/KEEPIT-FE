import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

export const TRADE_STEPS = ['신청', '수락', '전달', '수령', '반납', '완료'] as const;
export type TradeStep = (typeof TRADE_STEPS)[number];

interface TradeStepperProps {
  current: TradeStep;
}

export default function TradeStepper({
  current,
}: TradeStepperProps) {
  const currentIndex = TRADE_STEPS.indexOf(current);

  return (
    <View style={styles.container}>
      {TRADE_STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <View key={step} style={styles.step}>
            {/* 점 크기(12/16)가 달라도 라벨 높이가 맞도록 16×16 고정 박스 처리 */}
            <View style={styles.dotBox}>
              <View
                style={
                  isCurrent
                    ? styles.dotCurrent
                    : [styles.dot, isDone && styles.dotDone]
                }
              />
            </View>
            <Text
              style={[
                styles.label,
                isCurrent && styles.labelCurrent,
                !isDone && !isCurrent && styles.labelNext,
              ]}
            >
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  step: {
    alignItems: 'center',
    gap: 6,
  },

  dotBox: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.line,
  },

  dotDone: {
    backgroundColor: COLORS.primary,
  },

  dotCurrent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },

  label: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 16.8,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  labelCurrent: {
    fontFamily: 'Pretendard-Bold',
  },

  labelNext: {
    color: COLORS.textPlaceholder,
  },
});
