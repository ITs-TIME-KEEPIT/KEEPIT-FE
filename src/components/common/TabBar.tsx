import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../constants/colors';

export type TabKey = 'home' | 'trade' | 'my';

interface TabBarProps {
  active: TabKey;
  onPressTab: (key: TabKey) => void;
}

const TABS = [
  { key: 'home', label: '홈', icon: require('../../../assets/icons/home.png') },
  { key: 'trade', label: '내 거래', icon: require('../../../assets/icons/list.png') },
  { key: 'my', label: '마이', icon: require('../../../assets/icons/user.png') },
] as const;

export default function TabBar({
  active,
  onPressTab,
}: TabBarProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Math.max(bottom, 24),
        },
      ]}
    >
      {TABS.map(({ key, label, icon }) => {
        const isActive = key === active;
        const color = isActive ? COLORS.text : COLORS.textPlaceholder;

        return (
          <Pressable
            key={key}
            onPress={() => onPressTab(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Image
              source={icon}
              style={[styles.icon, { tintColor: color }]}
              resizeMode="contain"
            />
            <Text style={[styles.label, isActive && styles.labelActive, { color }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 25,
    right: 25,
    height: 68,
    padding: 4,
    borderRadius: 40,
    flexDirection: 'row',

    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: COLORS.glassLine,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },

  tabActive: {
    borderRadius: 32,
    backgroundColor: COLORS.glassActive,
  },

  icon: {
    width: 24,
    height: 24,
  },

  label: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    lineHeight: 17.4,
    letterSpacing: 0,
    includeFontPadding: false,
  },

  labelActive: {
    fontFamily: 'Pretendard-SemiBold',
  },
});

/* 
TabBar 사용법 - 최종 배포 시 주석은 삭제 예정

하단 탭바. 홈 / 내 거래 / 마이 3개 탭. 하단 SafeArea(홈 인디케이터) 여백은 자동 포함됩니다.

import TabBar, { TabKey } from '../../components/common/TabBar';

const [tab, setTab] = useState<TabKey>('home');

<TabBar active={tab} onPressTab={setTab} />
*/