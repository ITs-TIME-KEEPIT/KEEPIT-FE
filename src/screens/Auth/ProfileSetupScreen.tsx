
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
import { DEMO_ACTIVE_ROLE, DEMO_USERS } from '../../mocks/demoScenario';

import Header from '../../components/common/Header';
import CtaButton from '../../components/common/CtaButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import CtaDisabledButton from '../../components/common/CtaDisabledButton';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ProfileSetup'
>;

export default function ProfileSetupScreen({
  navigation,
}: Props) {
  const [nickname, setNickname] = useState<string>(__DEV__ ? DEMO_USERS[DEMO_ACTIVE_ROLE].name : '');
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
    if (__DEV__) {
      setNicknameVerified(true);
      Alert.alert('시연용 확인', '서버 중복 확인 전입니다. UI 시연을 위해 진행할 수 있어요.');
    } else {
      Alert.alert('중복 확인', '닉네임 중복 확인 API 연동 전입니다.');
    }
  };

  // 프로필 설정 완료
  const handleStart = () => {
    if (!canStart) return;

    // TODO: 서버에 프로필 저장 후 홈 화면으로 이동
    if (__DEV__) navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
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
          {/* 프로필 사진 영역 */}
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

          </View>

          {/* 입력 폼 */}
          <View style={styles.form}>

            {/* 닉네임 입력 행 */}
            <View style={styles.nicknameRow}>

              {/* 닉네임 입력창 */}
              <View style={styles.nicknameField}>

                <Text style={styles.inputLabel}>
                  닉네임 <Text style={styles.required}>*</Text>
                </Text>

                <TextInput
                  style={styles.nicknameInput}
                  placeholder="2~10자로 입력해주세요"
                  placeholderTextColor={COLORS.textSub}
                  value={nickname}
                  onChangeText={handleNicknameChange}
                  maxLength={20}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="닉네임"
                />

              </View>

              {/* 중복 확인 */}
              <SecondaryButton
                title="중복 확인"
                onPress={handleNicknameCheck}
                style={styles.duplicateButton}
              />

            </View>

            <View style={styles.phoneGroup}>
              {/* 휴대폰 번호 입력 */}
              <View style={styles.phoneField}>

                <Text style={styles.inputLabel}>
                  휴대폰 번호 <Text style={styles.required}>*</Text>
                </Text>

                <TextInput
                  style={styles.phoneInput}
                  placeholder="010-0000-0000"
                  placeholderTextColor={COLORS.textSub}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={13}
                  accessibilityLabel="휴대폰 번호"
                />

              </View>

              {/* 번호 공개 안내 */}
              <View style={styles.note}>

                <Image source={require('../../../assets/icons/info.png')} style={styles.infoIcon} resizeMode="contain" />

                <Text style={styles.noteText}>
                  번호는 거래가 수락된 상대에게만 공개되고, 거래 완료 7일 뒤 다시 숨겨져요
                </Text>

              </View>

            </View>
          </View>

        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomCta}>

          {canStart ? (
            <CtaButton title="시작하기" onPress={handleStart} />
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
    paddingHorizontal: 20,
    paddingBottom: 32,

    // 프로필 영역과 입력 폼 사이
    gap: 24,
  },

  // ===================================
  // 프로필 사진 영역
  // ===================================

  profileArea: {
    width: '100%',
    height: 88,

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
    height: 72,

    flexDirection: 'row',
    alignItems: 'flex-end',

    gap: 14,
  },

  nicknameField: {
    flex: 1,
    minWidth: 0,
    height: 72,

    flexDirection: 'column',
    gap: 6,
  },

  required: {
    color: COLORS.alert,
  },

  inputLabel: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,

    color: COLORS.text,

    letterSpacing: 0,
    includeFontPadding: false,
  },

  nicknameInput: {
    width: '100%',
    height: 46,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,

    paddingVertical: 12,
    paddingHorizontal: 14,

    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,

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
    height: 46,
  },


  // ===================================
  // 휴대폰 번호 입력
  // ===================================

  phoneGroup: {
    width: '100%',
    gap: 12,
  },

  phoneField: {
    width: '100%',
    height: 72,

    flexDirection: 'column',
    gap: 6,
  },

  phoneInput: {
    width: '100%',
    height: 46,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,

    paddingVertical: 12,
    paddingHorizontal: 14,

    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,

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
    minHeight: 58,

    flexDirection: 'row',
    alignItems: 'flex-start',

    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 12,

    gap: 6,

    backgroundColor: COLORS.bgGray,
    borderRadius: 12,
  },

  // 안내 아이콘
  infoIcon: {
    width: 16,
    height: 16,
    tintColor: COLORS.textSub,
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
    color: COLORS.textSub,

    includeFontPadding: false,
  },

  // ===================================
  // 하단 CTA
  // ===================================

  bottomCta: {
    width: '100%',

    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,

    backgroundColor: COLORS.white,
  },

});
