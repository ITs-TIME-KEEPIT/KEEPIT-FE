import React, { useRef, useState } from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../../constants/colors';

const THUMB = 22;

interface RangeSliderProps {
  maxValue: number;
  step: number;
  low: number;
  high: number | null; // null = 오른쪽 끝(상한 없음)
  onChange: (low: number, high: number | null) => void;
}

export default function RangeSlider({
  maxValue,
  step,
  low,
  high,
  onChange,
}: RangeSliderProps) {
  const [width, setWidth] = useState(0);

  // PanResponder는 한 번만 만들어지므로 최신 값은 ref로 읽음
  const latest = useRef({ low, high, width, onChange });
  latest.current = { low, high, width, onChange };

  const toX = (value: number, w: number) => (Math.min(value, maxValue) / maxValue) * w;
  const toValue = (x: number, w: number) =>
    Math.round((Math.max(0, Math.min(x, w)) / w) * (maxValue / step)) * step;

  const makePan = (thumb: 'low' | 'high') => {
    let startX = 0;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const s = latest.current;
        startX = toX(thumb === 'low' ? s.low : s.high ?? maxValue, s.width);
      },
      onPanResponderMove: (_, g) => {
        const s = latest.current;
        if (s.width === 0) return;
        const value = toValue(startX + g.dx, s.width);
        if (thumb === 'low') {
          s.onChange(Math.min(value, s.high ?? maxValue), s.high);
        } else {
          const next = Math.max(value, s.low);
          s.onChange(s.low, next >= maxValue ? null : next);
        }
      },
    });
  };

  const [lowPan] = useState(() => makePan('low'));
  const [highPan] = useState(() => makePan('high'));

  const lowX = toX(low, width);
  const highX = toX(high ?? maxValue, width);

  return (
    <View
      style={styles.container}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - THUMB)}
    >
      <View style={styles.track} />
      <View style={[styles.selected, { left: THUMB / 2 + lowX, width: Math.max(0, highX - lowX) }]} />

      <View
        {...lowPan.panHandlers}
        accessibilityLabel="최소 금액 손잡이"
        hitSlop={10}
        // 두 손잡이가 오른쪽 끝에서 겹치면 최소 손잡이를 위로 올려 왼쪽으로 끌 수 있게
        style={[styles.thumb, { left: lowX, zIndex: low > maxValue / 2 ? 1 : 0 }]}
      />
      <View
        {...highPan.panHandlers}
        accessibilityLabel="최대 금액 손잡이"
        hitSlop={10}
        style={[styles.thumb, { left: highX }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 24,
    justifyContent: 'center',
  },

  track: {
    position: 'absolute',
    left: THUMB / 2,
    right: THUMB / 2,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.line,
  },

  selected: {
    position: 'absolute',
    height: 4,
    backgroundColor: COLORS.primary,
  },

  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
});

/*
RangeSlider 사용법 - 최종 배포 시 주석은 삭제 예정

손잡이 2개짜리 범위 슬라이더. high가 null이면 오른쪽 끝(상한 없음).

import RangeSlider from './RangeSlider';

<RangeSlider
  maxValue={50000}
  step={1000}
  low={price.min}
  high={price.max}
  onChange={(min, max) => setPrice({ min, max })}
/>
*/
