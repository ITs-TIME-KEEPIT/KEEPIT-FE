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
          height: 64 + bottom,
          paddingBottom: 8 + bottom,
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
            style={styles.tab}
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
    width: '100%',
    flexDirection: 'row',

    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },

  icon: {
    width: 24,
    height: 24,
  },

  label: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    lineHeight: 15.4,
    letterSpacing: 0,
    includeFontPadding: false,
  },

  labelActive: {
    fontFamily: 'Pretendard-SemiBold',
  },
});
