import React, { useRef, useState } from 'react';

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
  Keyboard,
} from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { registerProfile } from '../../api/auth';
import { ApiError } from '../../api/client';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import { COLORS } from '../../constants/colors';
import { DEMO_USERS } from '../../mocks/demoScenario';
import { findDemoUser, updateProfile, useRentalState } from '../../state/rentalStore';

import Header from '../../components/common/Header';
import CtaButton from '../../components/common/CtaButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import CtaDisabledButton from '../../components/common/CtaDisabledButton';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

/* 가입 후 프로필 설정, 마이 > 프로필 수정 (route.params.edit) 공용 */
export default function ProfileSetupScreen({ navigation, route }: Props) {
  const { top } = useSafeAreaInsets();
  const isEdit = !!route.params?.edit;
  const { currentUserId } = useRentalState();
  const me = isEdit ? findDemoUser(currentUserId) : undefined;
  const [nickname, setNickname] = useState<string>(me?.name ?? '');
  const [photoUri, setPhotoUri] = useState(me?.photoUri);
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const submitting = useRef(false);
  const [saving, setSaving] = useState(false);
  const pickingPhoto = useRef(false);
  const [phone, setPhone] = useState(me?.phone ?? '');
  // 수정 화면에서 기존 닉네임은 이미 확인된 상태
  const [nicknameCheck, setNicknameCheck] = useState<'available' | 'taken' | 'unchecked'>(
    isEdit ? 'available' : 'unchecked',
  );
  const [showLengthError, setShowLengthError] = useState(false);

  // 닉네임 유효성 검사
  const nicknameLength = Array.from(nickname.trim()).length;

  const hasInvalidNicknameCharacters = /[^\p{L}\p{M}\p{N} ._·'’-]/u.test(nickname);
  const isNicknameValid =
    !hasInvalidNicknameCharacters && nicknameLength >= 2 && nicknameLength <= 10;
  const nicknameError = hasInvalidNicknameCharacters
    ? '닉네임에 사용할 수 없는 문자가 있어요.'
    : showLengthError
      ? '닉네임은 2~10자로 입력해주세요.'
      : nicknameCheck === 'taken'
        ? '이미 사용 중인 닉네임입니다.'
        : undefined;
  const nicknameMessage =
    nicknameError ?? (nicknameCheck === 'available' ? '사용 가능한 아이디입니다.' : undefined);

  // 휴대폰 번호 유효성 검사
  const isPhoneValid = /^010-\d{4}-\d{4}$/.test(phone);

  // 시작하기 활성화 조건
  const changed =
    !isEdit || nickname !== me?.name || phone !== me?.phone || photoUri !== me?.photoUri;
  const canStart =
    !saving &&
    isNicknameValid &&
    isPhoneValid &&
    changed &&
    (isEdit ? nicknameCheck === 'available' : nicknameCheck !== 'taken');

  // 닉네임 입력
  const handleNicknameChange = (text: string) => {
    const limited = Array.from(text).slice(0, 10).join('');

    setNickname(limited);

    // 닉네임 수정 시 기존 중복 확인 결과 초기화 (수정 화면에서 원래 닉네임으로 되돌리면 확인 불필요)
    setNicknameCheck(isEdit && limited === me?.name ? 'available' : 'unchecked');
    setShowLengthError(false);
  };

  // 휴대폰 번호 하이픈 자동 입력
  const handlePhoneChange = (text: string) => {
    const numbers = text.replace(/\D/g, '').slice(0, 11);

    let formatted = numbers;

    if (numbers.length > 7) {
      formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 7) + '-' + numbers.slice(7);
    } else if (numbers.length > 3) {
      formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
    }

    setPhone(formatted);
  };

  const selectPhoto = async (source: 'library' | 'camera') => {
    if (pickingPhoto.current) return;
    pickingPhoto.current = true;
    setPhotoMenuOpen(false);

    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('카메라 권한', '기기 설정에서 카메라 접근을 허용해주세요.');
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled && result.assets[0]?.uri) setPhotoUri(result.assets[0].uri);
    } catch {
      Alert.alert('프로필 사진', '사진을 불러오지 못했어요. 다시 시도해주세요.');
    } finally {
      pickingPhoto.current = false;
    }
  };

  // 닉네임 중복 확인
  const handleNicknameCheck = () => {
    if (!isNicknameValid) {
      setShowLengthError(!hasInvalidNicknameCharacters);
      return;
    }

    // TODO: 백엔드 닉네임 중복 확인 API 연동
    if (!__DEV__) {
      Alert.alert('중복 확인', '닉네임 중복 확인 API 연동 전입니다.');
      return;
    }

    const taken = Object.values(DEMO_USERS).some(
      ({ id }) =>
        id !== currentUserId && findDemoUser(id)?.name.toLowerCase() === nickname.toLowerCase(),
    );
    setNicknameCheck(taken ? 'taken' : 'available');
  };

  // 프로필 설정 완료
  const handleStart = async () => {
    if (!canStart || submitting.current || pickingPhoto.current) return;

    // TODO: 서버에 프로필 수정 저장
    if (isEdit) {
      updateProfile(currentUserId, { name: nickname, phone, photoUri });
      navigation.goBack();
      return;
    }

    submitting.current = true;
    setSaving(true);
    try {
      const image = photoUri
        ? await (
            await ImageManipulator.manipulate(photoUri).renderAsync()
          ).saveAsync({
            format: SaveFormat.JPEG,
            compress: 0.9,
          })
        : undefined;
      await registerProfile(nickname, phone, image?.uri);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'AUTH_409_2') {
        setNicknameCheck('taken');
      } else if (
        error instanceof ApiError &&
        (error.status === 401 || error.code === 'AUTH_409_1')
      ) {
        Alert.alert('프로필 등록', '카카오 로그인을 다시 진행해주세요.');
        navigation.goBack();
      } else {
        Alert.alert('프로필 등록', error instanceof Error ? error.message : '다시 시도해주세요.');
      }
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header - 390 x 56 */}
      <Header
        type="back"
        title={isEdit ? '프로필 수정' : '프로필 설정'}
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
              onPress={() => {
                Keyboard.dismiss();
                setPhotoMenuOpen(true);
              }}
              accessibilityRole="button"
              disabled={saving}
              accessibilityLabel="프로필 사진 선택"
              style={styles.profileImageButton}
            >
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={styles.selectedPhoto} />
                  <View style={styles.cameraBadge}>
                    <ExpoImage
                      source={require('../../../assets/icons/profile-camera.svg')}
                      style={styles.cameraBadgeIcon}
                      contentFit="contain"
                    />
                  </View>
                </>
              ) : (
                <Image
                  source={require('../../../assets/icons/profile-default.png')}
                  style={styles.profileImage}
                  resizeMode="contain"
                />
              )}
            </Pressable>
          </View>

          {/* 입력 폼 */}
          <View style={styles.form}>
            {/* 닉네임 입력 행 */}
            <View style={styles.nicknameGroup}>
              <View style={styles.nicknameRow}>
                {/* 닉네임 입력창 */}
                <View style={styles.nicknameField}>
                  <Text style={styles.inputLabel}>
                    닉네임 <Text style={styles.required}>*</Text>
                  </Text>

                  <TextInput
                    style={[styles.nicknameInput, nicknameError && styles.nicknameInputError]}
                    placeholder="2~10자로 입력해주세요"
                    placeholderTextColor={COLORS.textSub}
                    value={nickname}
                    editable={!saving}
                    onChangeText={handleNicknameChange}
                    maxLength={20}
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel="닉네임"
                  />
                </View>

                {/* 중복 확인 */}
                {isEdit && (
                  <SecondaryButton
                    title="중복 확인"
                    onPress={handleNicknameCheck}
                    style={styles.duplicateButton}
                  />
                )}
              </View>
              {nicknameMessage && (
                <Text
                  accessibilityLiveRegion="polite"
                  style={[styles.nicknameMessage, nicknameError && styles.nicknameMessageError]}
                >
                  {nicknameMessage}
                </Text>
              )}
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
                  editable={!saving}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={13}
                  accessibilityLabel="휴대폰 번호"
                />
              </View>

              {/* 번호 공개 안내 */}
              <View style={styles.note}>
                <Image
                  source={require('../../../assets/icons/info.png')}
                  style={styles.infoIcon}
                  resizeMode="contain"
                />

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
            <CtaButton title={isEdit ? '저장하기' : '시작하기'} onPress={handleStart} />
          ) : (
            <CtaDisabledButton title={saving ? '저장 중…' : isEdit ? '저장하기' : '시작하기'} />
          )}
        </View>
      </KeyboardAvoidingView>

      {photoMenuOpen && (
        <View style={styles.photoMenuOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPhotoMenuOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="프로필 사진 메뉴 닫기"
          />
          <View style={[styles.photoMenu, { top: top + 98 }]}>
            <Pressable
              style={styles.photoMenuRow}
              accessibilityRole="button"
              onPress={() => void selectPhoto('library')}
            >
              <ExpoImage
                source={require('../../../assets/icons/profile-library.svg')}
                style={styles.photoMenuIcon}
                contentFit="contain"
              />
              <Text style={styles.photoMenuText}>사진 보관함</Text>
            </Pressable>
            <Pressable
              style={[styles.photoMenuRow, styles.photoMenuDivider]}
              accessibilityRole="button"
              onPress={() => void selectPhoto('camera')}
            >
              <ExpoImage
                source={require('../../../assets/icons/profile-camera.svg')}
                style={styles.photoMenuIcon}
                contentFit="contain"
              />
              <Text style={styles.photoMenuText}>사진 찍기</Text>
            </Pressable>
          </View>
        </View>
      )}
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

  selectedPhoto: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },

  cameraBadge: {
    position: 'absolute',
    left: 60,
    top: 56,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraBadgeIcon: { width: 18.286, height: 18.286 },

  photoMenuOverlay: { ...StyleSheet.absoluteFill },
  photoMenu: {
    position: 'absolute',
    right: 20,
    width: 230,
    maxWidth: '90%',
    borderRadius: 12,
    backgroundColor: COLORS.white,
    boxShadow: '0px 3.68px 14.72px rgba(0, 0, 0, 0.1)',
  },
  photoMenuRow: {
    minHeight: 41,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  photoMenuDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
  photoMenuIcon: { width: 22, height: 22 },
  photoMenuText: {
    color: COLORS.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    includeFontPadding: false,
  },

  form: {
    width: '100%',

    flexDirection: 'column',

    // 닉네임 → 휴대폰 → 안내 박스
    gap: 24,
  },

  // ===================================
  // 닉네임 입력
  // ===================================

  nicknameGroup: {
    gap: 4,
  },

  nicknameRow: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'flex-end',

    gap: 14,
  },

  nicknameField: {
    flex: 1,
    minWidth: 0,

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

  nicknameInputError: {
    borderColor: COLORS.alert,
  },

  nicknameMessage: {
    paddingHorizontal: 4,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.text,
    includeFontPadding: false,
  },

  nicknameMessageError: {
    color: COLORS.alert,
  },

  duplicateButton: {
    alignSelf: 'flex-end',
    minWidth: 86,
    height: 46,
    paddingHorizontal: 8,
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
