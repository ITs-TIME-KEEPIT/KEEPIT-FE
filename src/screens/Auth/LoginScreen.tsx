import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { DEMO_LOGIN_MODE } from '../../mocks/demoScenario';

// 로그인 화면
export default function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) {

  // 카카오 로그인 버튼 클릭
  const handleKakaoLogin = () => {
    // TODO: 백엔드 카카오 OAuth 연동 후 로그인 처리
    // 화요일 UI 시연 경로. 실제 OAuth 인증/가입 여부 판별은 후속 연동.
    if (__DEV__) {
      if (DEMO_LOGIN_MODE === 'new') navigation.navigate('ProfileSetup');
      else navigation.reset({index:0,routes:[{name:'Main'}]});
    }
    else Alert.alert('안내', '카카오 로그인 연동 전입니다.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* 중앙 로고 영역 */}
      <View style={styles.body}>

        <Text style={styles.logo}>
          KEEPIT
        </Text>

        <Text style={styles.description}>
          한 번 입을 옷, 사지 말고 빌려요
        </Text>

      </View>

      {/* 하단 로그인 영역 */}
      <View style={styles.footer}>

        {/* 카카오 로그인 버튼 */}
        <TouchableOpacity
          style={styles.kakaoButton}
          onPress={handleKakaoLogin}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="카카오로 시작하기"
        >
          <Text style={styles.kakaoButtonText}>
            카카오로 시작하기
          </Text>
        </TouchableOpacity>

        {/* 약관 안내 문구 */}
        <Text style={styles.termsText}>
          가입하면 이용약관과 개인정보 처리방침에 동의하게 돼요
        </Text>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  // 전체 화면
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // 중앙 로고 영역 (Figma: Body)
  body: {
    flex: 1,
    paddingTop: 64,
    paddingBottom: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  // KEEPIT 로고
  logo: {
    fontFamily: 'Pretendard-ExtraBold',
    fontSize: 40,
    lineHeight: 58,
    color: COLORS.primary,
    textAlign: 'center',
  },

  // 로고 하단 설명
  description: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    lineHeight: 23.2,
    color: COLORS.textSub,
    textAlign: 'center',
  },

  // 하단 로그인 영역 (Figma: Frame)
  footer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },

  // 카카오 로그인 버튼
  kakaoButton: {
    width: '100%',
    height: 53,
    backgroundColor: COLORS.kakao,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 카카오 버튼 텍스트
  kakaoButtonText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
    lineHeight: 26.1,
    color: COLORS.text,
    textAlign: 'center',
  },

  // 약관 안내 문구
  termsText: {
    width: '100%',
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18.85,
    color: COLORS.textSub,
    textAlign: 'center',
  },

});
