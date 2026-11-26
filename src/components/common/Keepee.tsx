import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleProp, View, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

// Lottie 캔버스에서 캐릭터 프레임이 놓인 위치. 글로우와 색종이가 잘리지 않도록 캔버스가 캐릭터보다 큽니다
const MOTIONS = {
  happy: {
    source: require('../../../assets/lottie/keepee-happy.json'),
    width: 160,
    height: 160,
    left: 27.5,
    top: 40,
  },
  idle: {
    source: require('../../../assets/lottie/keepee-idle.json'),
    width: 102,
    height: 112,
    left: 6,
    top: 6,
  },
  error: {
    source: require('../../../assets/lottie/keepee-error.json'),
    width: 102,
    height: 112,
    left: 6,
    top: 6,
  },
};

interface KeepeeProps {
  motion: keyof typeof MOTIONS;
  /** 캐릭터 프레임 크기 (happy 105×110, idle·error 90×100 기준) */
  style?: StyleProp<ViewStyle>;
}

export default function Keepee({ motion, style }: KeepeeProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  const { source, width, height, left, top } = MOTIONS[motion];

  return (
    <View style={style} pointerEvents="none">
      <LottieView
        // 동작 줄이기 설정이 바뀌면 다시 마운트해 첫 프레임에서 멈추거나 다시 재생합니다
        key={String(reduceMotion)}
        source={source}
        autoPlay={!reduceMotion}
        loop
        style={{ position: 'absolute', left: -left, top: -top, width, height }}
      />
    </View>
  );
}
