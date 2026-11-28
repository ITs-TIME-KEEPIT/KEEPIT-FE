module.exports = ({ config }) => {
  const kakaoKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
  const allowLocalHttp = process.env.EXPO_PUBLIC_ALLOW_LOCAL_HTTP === 'true';
  const apiDemo = process.env.EXPO_PUBLIC_API_DEMO_MODE === 'true';

  return {
    ...config,
    ...((kakaoKey || apiDemo) && {
      android: { ...config.android, package: config.android?.package ?? 'com.keepit.local' },
      ios: { ...config.ios, bundleIdentifier: config.ios?.bundleIdentifier ?? 'com.keepit.local' },
    }),
    plugins: [
      ...config.plugins,
      'expo-secure-store',
      ...(kakaoKey
        ? [
            [
              '@react-native-kakao/core',
              {
                nativeAppKey: kakaoKey,
                android: { authCodeHandlerActivity: true },
                ios: { handleKakaoOpenUrl: true },
              },
            ],
          ]
        : []),
      ...(allowLocalHttp
        ? [['expo-build-properties', { android: { usesCleartextTraffic: true } }]]
        : []),
    ],
  };
};
