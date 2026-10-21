
import React, { useState } from 'react';

import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import { COLORS } from '../../constants/colors';

import Header from '../../components/common/Header';
import CtaDisabledButton from '../../components/common/CtaDisabledButton';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ProfileSetup'
>;

export default function ProfileSetupScreen({
  navigation,
}: Props) {
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [nicknameVerified, setNicknameVerified] = useState(false);

  // 닉네임 유효성 검사
  const nicknameLength = Array.from(nickname).length;

  const isNicknameValid =
    nicknameLength >= 2 && nicknameLength <= 10;

  // 휴대폰 번호 유효성 검사
  const isPhoneValid = /^010-\d{4}-\d{4}$/.test(phone);

  // 시작하기 활성화 조건
  const canStart =
    isNicknameValid &&
    isPhoneValid &&
    nicknameVerified;

  // 닉네임 입력
  const handleNicknameChange = (text: string) => {
    const limited = Array.from(text)
      .slice(0, 10)
      .join('');

    setNickname(limited);

    // 닉네임 수정 시 기존 중복 확인 결과 초기화
    setNicknameVerified(false);
  };

  // 휴대폰 번호 하이픈 자동 입력
  const handlePhoneChange = (text: string) => {
    const numbers = text
      .replace(/\D/g, '')
      .slice(0, 11);

    let formatted = numbers;

    if (numbers.length > 7) {
      formatted =
        numbers.slice(0, 3) +
        '-' +
        numbers.slice(3, 7) +
        '-' +
        numbers.slice(7);
    } else if (numbers.length > 3) {
      formatted =
        numbers.slice(0, 3) +
        '-' +
        numbers.slice(3);
    }

    setPhone(formatted);
  };

  // 프로필 이미지 선택
  const handleProfileImage = () => {
    Alert.alert(
      '프로필 사진',
      '사진 선택 기능은 추후 연동 예정입니다.',
    );
  };

  // 닉네임 중복 확인
  const handleNicknameCheck = () => {
    if (!isNicknameValid) {
      Alert.alert(
        '닉네임 확인',
        '닉네임은 2~10자로 입력해주세요.',
      );
      return;
    }

    // TODO: 백엔드 닉네임 중복 확인 API 연동
    Alert.alert(
      '중복 확인',
      '닉네임 중복 확인 API 연동 전입니다.',
    );
  };

  // 프로필 설정 완료
  const handleStart = () => {
    if (!canStart) return;

    // TODO: 서버에 프로필 저장 후 홈 화면으로 이동
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* Header - 390 x 56 */}
      <Header
        type="back"
        title="프로필 설정"
        onPressLeft={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Body */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 프로필 사진 영역 - 358 x 115 */}
          <View style={styles.profileArea}>

            <Pressable
              onPress={handleProfileImage}
              accessibilityRole="button"
              accessibilityLabel="프로필 사진 선택"
              style={styles.profileImageButton}
            >
              <Image
                source={require('../../../assets/icons/profile-default.png')}
                style={styles.profileImage}
                resizeMode="contain"
              />
            </Pressable>

            <Text style={styles.profileLabel}>
              프로필사진
            </Text>

          </View>

          {/* 입력 폼 */}
          <View style={styles.form}>

            {/* 닉네임 입력 행 - 358 x 73 */}
            <View style={styles.nicknameRow}>

              {/* 입력창 - 264 x 73 */}
              <View style={styles.nicknameField}>

                <Text style={styles.inputLabel}>
                  닉네임 [필수]
                </Text>

                <TextInput
                  style={styles.nicknameInput}
                  placeholder="2~10자로 입력해주세요"
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={nickname}
                  onChangeText={handleNicknameChange}
                  maxLength={20}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="닉네임"
                />

              </View>

              {/* 중복 확인 - 86 x 42 */}
              <Pressable
                onPress={handleNicknameCheck}
                accessibilityRole="button"
                accessibilityLabel="닉네임 중복 확인"
                style={styles.duplicateButton}
              >
                <Text style={styles.duplicateText}>
                  중복 확인
                </Text>
              </Pressable>

            </View>

            {/* 휴대폰 번호 입력 - 358 x 73 */}
            <View style={styles.phoneField}>

              <Text style={styles.inputLabel}>
                휴대폰 번호 [필수]
              </Text>

              <TextInput
                style={styles.phoneInput}
                placeholder="010-0000-0000"
                placeholderTextColor={COLORS.textPlaceholder}
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={13}
                accessibilityLabel="휴대폰 번호"
              />

            </View>

            {/* 번호 공개 안내 - 358 x 58 */}
            <View style={styles.note}>

              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>
                  i
                </Text>
              </View>

              <Text style={styles.noteText}>
                번호는 거래가 수락된 상대에게만 공개되고, 거래 완료 7일 뒤 다시 숨겨져요
              </Text>

            </View>

          </View>

        </ScrollView>

        {/* Bottom CTA - 390 x 89 */}
        <View style={styles.bottomCta}>

          {canStart ? (
            <Pressable
              style={styles.activeButton}
              onPress={handleStart}
              accessibilityRole="button"
            >
              <Text style={styles.activeButtonText}>
                시작하기
              </Text>
            </Pressable>
          ) : (
            <CtaDisabledButton title="시작하기" />
          )}

        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  // ===================================
  // 전체 화면
  // ===================================

  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  // ===================================
  // Body
  // ===================================

  body: {
    flexGrow: 1,

    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 24,

    // 프로필 영역과 입력 폼 사이
    gap: 24,
  },

  // ===================================
  // 프로필 사진 영역
  // ===================================

  profileArea: {
    width: '100%',
    height: 115,

    flexDirection: 'column',
    alignItems: 'center',

    // 사진과 문구 사이
    gap: 8,
  },

  profileImageButton: {
    width: 88,
    height: 88,
  },

  profileImage: {
    width: 88,
    height: 88,
  },

  profileLabel: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    lineHeight: 19,

    color: COLORS.textSub,

    letterSpacing: 0,
    textAlign: 'center',
    includeFontPadding: false,
  },

  // ===================================
  // 입력 폼
  // ===================================

  form: {
    width: '100%',

    flexDirection: 'column',

    // 닉네임 → 휴대폰 → 안내 박스
    gap: 24,
  },

  // ===================================
  // 닉네임 입력
  // ===================================

  nicknameRow: {
    width: '100%',
    height: 73,

    flexDirection: 'row',
    alignItems: 'flex-end',

    gap: 8,
  },

  nicknameField: {
    flex: 1,
    minWidth: 0,
    height: 73,

    flexDirection: 'column',
    gap: 6,
  },

  inputLabel: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20,

    color: '#1F2937',

    letterSpacing: 0,
    includeFontPadding: false,
  },

  nicknameInput: {
    width: '100%',
    height: 47,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,

    paddingVertical: 12,
    paddingHorizontal: 14,

    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 21,

    color: COLORS.text,

    letterSpacing: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  // ===================================
  // 닉네임 중복 확인 버튼
  // ===================================

  duplicateButton: {
    width: 86,
    height: 42,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 6,

    backgroundColor: COLORS.white,
  },

  duplicateText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    lineHeight: 20,

    color: COLORS.primary,

    letterSpacing: 0,
    includeFontPadding: false,
  },

  // ===================================
  // 휴대폰 번호 입력
  // ===================================

  phoneField: {
    width: '100%',
    height: 73,

    flexDirection: 'column',
    gap: 6,
  },

  phoneInput: {
    width: '100%',
    height: 47,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,

    paddingVertical: 12,
    paddingHorizontal: 14,

    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 21,

    color: COLORS.text,

    letterSpacing: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  // ===================================
  // 번호 공개 안내 박스
  // Figma: 358 x 58
  // ===================================

  note: {
    width: '100%',
    height: 58,

    flexDirection: 'row',
    alignItems: 'flex-start',

    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 12,

    gap: 6,

    backgroundColor: '#EAF4FC',
    borderRadius: 8,
  },

  // 안내 아이콘
  infoIcon: {
    width: 16,
    height: 16,

    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 1,
  },

  infoIconText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
    lineHeight: 13,

    color: COLORS.primary,

    includeFontPadding: false,
  },

  // 안내 문구
  // 358 - 24(Padding) - 16(Icon) - 6(Gap) = 312
  noteText: {
    flex: 1,
    minWidth: 0,

    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18.85,

    letterSpacing: 0,
    color: '#1F2937',

    includeFontPadding: false,
  },

  // ===================================
  // 하단 CTA
  // ===================================

  bottomCta: {
    width: '100%',

    borderTopWidth: 1,
    borderTopColor: COLORS.line,

    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,

    backgroundColor: COLORS.white,
  },

  // 시작하기 활성화 상태
  activeButton: {
    width: '100%',
    height: 52,

    backgroundColor: COLORS.primary,
    borderRadius: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeButtonText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    lineHeight: 22.4,

    letterSpacing: 0,
    color: COLORS.white,

    includeFontPadding: false,
  },
});
