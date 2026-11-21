import React, { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MainTabScreenProps } from '../../navigation/RootNavigator';

import { COLORS } from '../../constants/colors';
import { useClothingItems } from '../../state/clothingStore';
import {
  findDemoUser,
  resetRentals,
  switchDemoUser,
  useRentalState,
} from '../../state/rentalStore';

import RoundImage from '../../components/common/RoundImage';
import Popup from '../../components/common/Popup';
import { ACTIVE_STAGES } from '../../utils/myClothes';

// 010-0000-0001 → 010-****-0001
const maskPhone = (phone?: string) => phone?.replace(/-(\d{4})-/, '-****-') ?? '-';

/* 하단 탭 '마이' (Figma F. 마이페이지) */
export default function MyPageScreen({ navigation }: MainTabScreenProps<'MyPage'>) {
  const { bottom } = useSafeAreaInsets();
  const { currentUserId, rentals } = useRentalState();
  const clothes = useClothingItems();
  const me = findDemoUser(currentUserId);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const mine = rentals.filter(
    (rental) => rental.ownerId === currentUserId || rental.borrowerId === currentUserId,
  );
  const stats = [
    {
      label: '등록한 옷',
      value: clothes.filter((cloth) => cloth.ownerId === currentUserId && !cloth.deleted).length,
    },
    {
      label: '진행 중 거래',
      value: mine.filter((rental) => ACTIVE_STAGES.includes(rental.stage)).length,
    },
    { label: '완료 거래', value: mine.filter((rental) => rental.stage === 'completed').length },
  ];

  const menus = [
    { label: '내 등록 옷 관리', onPress: () => navigation.navigate('MyClothes') },
    { label: '받은 신청', onPress: () => navigation.navigate('ReceivedRequests') },
    { label: '알림', onPress: () => navigation.navigate('Notifications') },
    { label: '로그아웃', onPress: () => setLogoutOpen(true) },
    { label: '회원 탈퇴', onPress: () => navigation.navigate('Withdraw'), muted: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>마이</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: 110 + bottom }]}>
        <Pressable
          onPress={() => navigation.navigate('ProfileSetup', { edit: true })}
          accessibilityRole="button"
          accessibilityLabel="프로필 수정"
          style={styles.profile}
        >
          <RoundImage size={56} source={me?.photoUri ? { uri: me.photoUri } : undefined} />
          <View style={styles.profileTexts}>
            <Text style={styles.name}>{me?.name ?? '-'}</Text>
            <Text style={styles.sub}>
              {me?.region.district ?? '-'} · {maskPhone(me?.phone)}
            </Text>
          </View>
          <Image
            source={require('../../../assets/icons/chevron-right.png')}
            style={styles.profileChevron}
            resizeMode="contain"
          />
        </Pressable>

        <View style={styles.stats}>
          {stats.map((stat) => (
            <Pressable
              key={stat.label}
              style={styles.stat}
              accessibilityRole="button"
              onPress={() =>
                stat.label === '등록한 옷'
                  ? navigation.navigate('MyClothes')
                  : navigation.navigate('MyTrades')
              }
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.menus}>
          {menus.map((menu) => (
            <MenuRow
              key={menu.label}
              label={menu.label}
              muted={menu.muted}
              onPress={menu.onPress}
            />
          ))}
        </View>

        {/* 시연용: 폰 한 대에서 등록자 ↔ 대여자 전환 */}
        {__DEV__ && (
          <View style={styles.demo}>
            <Text style={styles.demoTitle}>시연용</Text>
            <MenuRow
              label={`계정 전환 (지금: ${me?.name ?? '-'})`}
              onPress={() => {
                switchDemoUser();
                navigation.navigate('Home');
              }}
            />
            {/* 내 등록 옷 관리 연결 전까지 받은 신청 진입용 */}
            <MenuRow
              label="받은 신청 바로가기"
              onPress={() => navigation.navigate('ReceivedRequests')}
            />
            <MenuRow
              label="신청·거래 초기화"
              onPress={() =>
                Alert.alert('시연 초기화', '신청과 거래를 모두 지울까요?', [
                  { text: '취소', style: 'cancel' },
                  { text: '초기화', style: 'destructive', onPress: resetRentals },
                ])
              }
            />
          </View>
        )}
      </ScrollView>

      <Popup
        visible={logoutOpen}
        title="로그아웃 하시겠어요?"
        description={'로그아웃 시 새로운 대여 신청이나 거래 관련\n알림을 받지 못할 수 있어요.'}
        primaryLabel="로그아웃"
        onPressPrimary={() => {
          setLogoutOpen(false);
          // TODO: 로그인 연동 후 저장된 로그인 정보 삭제
          // 탭 안에서는 루트 스택을 초기화해야 온보딩으로 돌아갑니다
          navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
        }}
        secondaryLabel="취소"
        onPressSecondary={() => setLogoutOpen(false)}
        onClose={() => setLogoutOpen(false)}
      />
    </SafeAreaView>
  );
}

function MenuRow({
  label,
  muted = false,
  onPress,
}: {
  label: string;
  muted?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.menu}>
      <Text style={[styles.menuText, muted && styles.menuTextMuted]}>{label}</Text>
      <Image
        source={require('../../../assets/icons/chevron-right.png')}
        style={styles.chevron}
        resizeMode="contain"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  titleBar: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  title: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    lineHeight: 29,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  body: {
    paddingTop: 8,
    paddingHorizontal: 20,
  },

  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 20,
  },

  profileChevron: {
    width: 24,
    height: 24,
    tintColor: COLORS.text,
  },

  profileTexts: {
    flex: 1,
  },

  name: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    lineHeight: 23.2,
    color: COLORS.text,
    includeFontPadding: false,
  },

  sub: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18.85,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  stats: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.bgLight,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },

  statValue: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    lineHeight: 26.1,
    color: COLORS.text,
    includeFontPadding: false,
  },

  statLabel: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  menus: {
    paddingTop: 12,
    gap: 4,
  },

  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },

  menuText: {
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.text,
    includeFontPadding: false,
  },

  menuTextMuted: {
    fontSize: 15,
    lineHeight: 21.75,
    color: COLORS.textPlaceholder,
  },

  chevron: {
    width: 20,
    height: 20,
    tintColor: COLORS.text,
  },

  demo: {
    marginTop: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bgGray,
  },

  demoTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    lineHeight: 17.4,
    color: COLORS.textSub,
    includeFontPadding: false,
  },
});
