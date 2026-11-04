import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import { COLORS } from '../../constants/colors';

import CtaButton from '../../components/common/CtaButton';

type Props = NativeStackScreenProps<RootStackParamList, 'RentalComplete'>;

export default function RentalCompleteScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <Image
            source={require('../../../assets/icons/check.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>대여를 신청했어요</Text>
        <Text style={styles.description}>
          등록자가 48시간 안에 수락하면 알림으로 알려드릴게요.{'\n'}
          수락되면 서로의 연락처가 공개돼요.
        </Text>
      </View>

      <View style={styles.bottomCta}>
        {/* 신청 흐름을 스택에서 지우고 홈으로 */}
        <CtaButton
          title="홈으로"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
        />
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
  },

  icon: {
    width: 32,
    height: 32,
    tintColor: COLORS.primary,
  },

  title: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
    lineHeight: 29,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  description: {
    textAlign: 'center',
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  bottomCta: {
    width: '100%',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.white,
  },
});
