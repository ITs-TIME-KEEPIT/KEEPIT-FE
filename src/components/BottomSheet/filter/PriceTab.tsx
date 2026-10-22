import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../../constants/colors';
import type { DetailFilter } from '../../../types/filter';

import RangeSlider from './RangeSlider';
import TextInputField from '../../common/TextInputField';
import ChipButton from '../../common/ChipButton';
import ChipActiveButton from '../../common/ChipActiveButton';

type Price = DetailFilter['price'];

const PRICE_MAX = 50000;
const PRICE_STEP = 1000;

const QUICK_PRICES = [
  { label: '~1만원', min: 0, max: 10000 },
  { label: '1~3만원', min: 10000, max: 30000 },
  { label: '3~5만원', min: 30000, max: 50000 },
  { label: '5만원 이상', min: 50000, max: null },
] as const;

const formatNumber = (value: number) => value.toLocaleString('ko-KR');
const onlyDigits = (text: string) => text.replace(/\D/g, '');

interface PriceTabProps {
  price: Price;
  onChange: (price: Price) => void;
}

export default function PriceTab({
  price,
  onChange,
}: PriceTabProps) {
  const { min, max } = price;

  const rangeText =
    max !== null
      ? `${formatNumber(min)}원 ~ ${formatNumber(max)}원`
      : min >= PRICE_MAX
        ? `${formatNumber(PRICE_MAX)}원 이상`
        : `${formatNumber(min)}원 ~ ${formatNumber(PRICE_MAX)}원 이상`;

  // 입력이 끝났을 때 최소가 최대보다 크면 두 값을 바꿈
  const swapIfReversed = () => {
    if (max !== null && min > max) onChange({ min: max, max: min });
  };

  return (
    <View style={styles.container}>
      <View style={styles.group}>
        <View style={styles.titleRow}>
          <Text style={styles.groupTitle}>대여료</Text>
          <Text style={styles.hint}>직거래 기준, 택배비 제외</Text>
        </View>

        <Text style={styles.range}>
          {rangeText}
        </Text>

        <RangeSlider
          maxValue={PRICE_MAX}
          step={PRICE_STEP}
          low={min}
          high={max}
          onChange={(low, high) => onChange({ min: low, max: high })}
        />

        <View style={styles.ticks}>
          <Text style={styles.hint}>0원</Text>
          <Text style={styles.hint}>2.5만원</Text>
          <Text style={styles.hint}>5만원+</Text>
        </View>

        <View style={styles.inputs}>
          <View style={styles.input}>
            <TextInputField
              label="최소"
              placeholder="0"
              value={min === 0 ? '' : formatNumber(min)}
              onChangeText={(text) => onChange({ min: Number(onlyDigits(text)), max })}
              onBlur={swapIfReversed}
              keyboardType="number-pad"
            />
          </View>
          <Text style={styles.tilde}>~</Text>
          <View style={styles.input}>
            <TextInputField
              label="최대"
              placeholder="상한 없음"
              value={max === null ? '' : formatNumber(max)}
              onChangeText={(text) => {
                const digits = onlyDigits(text);
                onChange({ min, max: digits ? Number(digits) : null });
              }}
              onBlur={swapIfReversed}
              keyboardType="number-pad"
            />
          </View>
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>빠른 선택</Text>
        <View style={styles.chips}>
          {QUICK_PRICES.map((quick) => {
            const onPress = () => onChange({ min: quick.min, max: quick.max });
            return quick.min === min && quick.max === max ? (
              <ChipActiveButton key={quick.label} title={quick.label} onPress={onPress} />
            ) : (
              <ChipButton key={quick.label} title={quick.label} onPress={onPress} />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },

  group: {
    gap: 10,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  groupTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  hint: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 16.8,
    letterSpacing: 0,
    color: COLORS.textPlaceholder,
    includeFontPadding: false,
  },

  range: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    lineHeight: 22.4,
    letterSpacing: 0,
    color: COLORS.primary,
    includeFontPadding: false,
  },

  ticks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  inputs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },

  input: {
    flex: 1,
  },

  // 입력 박스 세로 가운데에 맞춤
  tilde: {
    paddingBottom: 12,
    fontFamily: 'Pretendard-Regular',
    fontSize: 16,
    lineHeight: 22.4,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
});
