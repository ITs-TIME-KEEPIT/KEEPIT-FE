import React, { useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { COLORS } from '../../constants/colors';

const SPLASH_MS = 1500;

/* 앱 시작 화면 (Figma A. 스플래시) */
export default function SplashScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Splash'>) {
  useEffect(() => {
    // TODO: 로그인 연동 후 저장된 로그인 정보가 있으면 바로 Main으로 이동
    const timer = setTimeout(() => navigation.replace('Onboarding'), SPLASH_MS);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <Image
          source={require('../../../assets/icons/logo.svg')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.slogan}>Wear the Moment</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },

  brand: {
    marginTop: 250,
    alignItems: 'center',
    gap: 8,
  },

  logo: {
    width: 131,
    height: 43,
  },

  slogan: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    lineHeight: 23.2,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },
});
