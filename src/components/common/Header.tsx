import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface HeaderProps {
  type?: 'home' | 'back' | 'close';
  title?: string;
  location?: string;
  onPressLeft?: () => void;
  onPressLocation?: () => void;
  onPressSearch?: () => void;
  onPressBell?: () => void;
}

export default function Header({
  type = 'home',
  title,
  location,
  onPressLeft,
  onPressLocation,
  onPressSearch,
  onPressBell,
}: HeaderProps) {
  if (type === 'home') {
    return (
      <View style={styles.container}>
        <Pressable
          onPress={onPressLocation}
          accessibilityRole="button"
          accessibilityLabel="지역 선택"
          style={styles.location}
        >
          <Text style={styles.locationText}>
            {location}
          </Text>
          <Image
            source={require('../../../assets/icons/chevron-down.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            onPress={onPressSearch}
            accessibilityRole="button"
            accessibilityLabel="검색"
            hitSlop={8}
          >
            <Image
              source={require('../../../assets/icons/search.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </Pressable>
          <Pressable
            onPress={onPressBell}
            accessibilityRole="button"
            accessibilityLabel="알림"
            hitSlop={8}
          >
            <Image
              source={require('../../../assets/icons/bell.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.bordered]}>
      <Pressable
        onPress={onPressLeft}
        accessibilityRole="button"
        accessibilityLabel={type === 'back' ? '뒤로가기' : '닫기'}
        hitSlop={8}
      >
        <Image
          source={
            type === 'back'
              ? require('../../../assets/icons/chevron-left.png')
              : require('../../../assets/icons/x.png')
          }
          style={styles.icon}
          resizeMode="contain"
        />
      </Pressable>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* 제목을 가운데 두기 위한 spacer */}
      <View style={styles.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 56,
    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: COLORS.white,
  },

  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },

  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  locationText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 18,
    lineHeight: 25.2,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  title: {
    flex: 1,
    textAlign: 'center',

    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
    lineHeight: 23.8,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  icon: {
    width: 24,
    height: 24,
    tintColor: COLORS.text,
  },
});
