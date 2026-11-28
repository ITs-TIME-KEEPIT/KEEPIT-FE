import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { apiPost, ApiError, setApiAccessToken } from './client';

type LoginResult = {
  status: 'PROFILE_REQUIRED' | 'AUTHENTICATED';
  userId: number;
  accessToken?: string;
  refreshToken?: string;
  signupToken?: string;
};

type Session = { userId: number; accessToken: string; refreshToken: string };
const SESSION_KEY = 'keepit.session';
let signupToken: string | undefined;

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<Session>;
  return (
    Number.isSafeInteger(session.userId) &&
    typeof session.accessToken === 'string' &&
    !!session.accessToken &&
    typeof session.refreshToken === 'string' &&
    !!session.refreshToken
  );
}

async function saveSession(result: LoginResult) {
  const { userId, accessToken, refreshToken } = result;
  const session = { userId, accessToken, refreshToken };
  if (result.status !== 'AUTHENTICATED' || !isSession(session)) {
    throw new Error('로그인 응답에서 세션을 확인할 수 없어요.');
  }
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  setApiAccessToken(session.accessToken);
  signupToken = undefined;
}

export async function restoreSession() {
  if (Platform.OS === 'web') return false;
  const stored = await SecureStore.getItemAsync(SESSION_KEY);
  if (!stored) return false;
  const session: unknown = JSON.parse(stored);
  if (!isSession(session)) return false;
  setApiAccessToken(session.accessToken);
  return true;
}

export async function clearSession() {
  if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(SESSION_KEY);
  setApiAccessToken();
  signupToken = undefined;
}

export async function signInWithKakao() {
  const appKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
  if (Platform.OS === 'web' || !appKey) {
    throw new Error('카카오 로그인에 필요한 네이티브 앱 키와 모바일 개발 빌드를 확인해주세요.');
  }
  signupToken = undefined;
  const { initializeKakaoSDK } = await import('@react-native-kakao/core');
  await initializeKakaoSDK(appKey);
  const { login } = await import('@react-native-kakao/user');
  const token = await login();
  if (!token?.accessToken) throw new Error('카카오 인증 토큰을 받지 못했어요.');

  const result = await apiPost<LoginResult>(
    '/api/v1/auth/kakao/login',
    undefined,
    token.accessToken,
  );
  if (result?.status === 'PROFILE_REQUIRED' && result.signupToken) {
    signupToken = result.signupToken;
    return 'PROFILE_REQUIRED';
  }
  if (!result) throw new Error('로그인 응답을 확인할 수 없어요.');
  await saveSession(result);
  return 'AUTHENTICATED';
}

export async function registerProfile(nickname: string, phone: string, photoUri?: string) {
  if (!signupToken) throw new ApiError('카카오 로그인을 다시 진행해주세요.', 401);
  const body = new FormData();
  body.append('nickname', nickname.trim());
  body.append('phone', phone.replace(/\D/g, ''));
  if (photoUri) {
    body.append('profileImage', {
      uri: photoUri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
  }
  const result = await apiPost<LoginResult>('/api/v1/users/profile', body, signupToken);
  await saveSession(result);
}
