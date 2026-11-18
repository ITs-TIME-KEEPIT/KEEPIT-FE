import React, { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { COLORS } from '../../constants/colors';
import { DEMO_LOGIN_MODE } from '../../mocks/demoScenario';

const PAGES = [
  {
    image: require('../../../assets/icons/onboarding-1.png'),
    title: '중요한 날, 입을 옷이 없을 때',
    body: '면접룩부터 하객룩까지\nkeepit 에서 골라봐요!',
  },
  {
    image: require('../../../assets/icons/onboarding-2.png'),
    title: '누군가의 특별한 날을 위해',
    body: '한 번 입고 만 옷도\n누군가에겐 가장 중요한 날의 한 벌이에요.',
  },
  {
    image: require('../../../assets/icons/onboarding-3.png'),
    title: '빌려주는 마음이 불안하지 않게',
    body: '등록부터 반납까지 사진 기록으로\n서로 안심하고 거래해요.',
  },
];

/* 첫 실행 안내 3장 + 카카오 시작 (Figma A. 온보딩) */
export default function OnboardingScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Onboarding'>) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  // 카카오 로그인 하나로 가입·로그인을 함께 처리합니다 (AUTH-100)
  // TODO: 카카오 OAuth API 연동 후 서버 응답의 신규 회원 여부로 demoMode를 대체
  const handleKakaoLogin = (demoMode = DEMO_LOGIN_MODE) => {
    if (!__DEV__) {
      Alert.alert('안내', '카카오 로그인 연동 전입니다.');
      return;
    }
    if (demoMode === 'new') navigation.navigate('ProfileSetup');
    else navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <FlatList
          data={PAGES}
          horizontal
          pagingEnabled
          style={styles.pager}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.title}
          onMomentumScrollEnd={(event) =>
            setPage(Math.round(event.nativeEvent.contentOffset.x / width))
          }
          renderItem={({ item }) => (
            <View style={[styles.page, { width }]}>
              <Image source={item.image} style={styles.illustration} contentFit="contain" />
              <View style={styles.texts}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.body}</Text>
              </View>
            </View>
          )}
        />

        <View style={styles.dots}>
          {PAGES.map((item, index) => (
            <View key={item.title} style={[styles.dot, index === page && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => handleKakaoLogin()}
          accessibilityRole="button"
          accessibilityLabel="카카오로 시작하기"
          style={styles.kakaoButton}
        >
          <Text style={styles.kakaoText}>카카오로 시작하기</Text>
        </Pressable>

        <Text style={styles.loginGuide}>
          이미 가입하셨나요?{' '}
          <Text
            style={styles.loginLink}
            // 시연: 이미 가입한 회원으로 바로 홈 진입
            onPress={() => handleKakaoLogin('existing')}
            accessibilityRole="link"
          >
            로그인
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  body: {
    flex: 1,
    justifyContent: 'center',
  },

  // 가로 목록이 세로로 꽉 차지 않게 해서 점을 문구 바로 아래에 둡니다
  pager: {
    flexGrow: 0,
  },

  page: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
  },

  illustration: {
    width: 230,
    height: 217,
  },

  texts: {
    alignItems: 'center',
    gap: 10,
  },

  title: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    lineHeight: 29,
    letterSpacing: 0,
    color: COLORS.text,
    textAlign: 'center',
    includeFontPadding: false,
  },

  description: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 21.75,
    letterSpacing: 0,
    color: COLORS.text,
    textAlign: 'center',
    includeFontPadding: false,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 40,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.line,
  },

  dotActive: {
    width: 20,
    backgroundColor: COLORS.primary,
  },

  footer: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  kakaoButton: {
    height: 53,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.kakao,
  },

  kakaoText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
    lineHeight: 26.1,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  loginGuide: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18.85,
    letterSpacing: 0,
    color: COLORS.textSub,
    textAlign: 'center',
    includeFontPadding: false,
  },

  loginLink: {
    textDecorationLine: 'underline',
  },
});
