import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MainTabScreenProps } from '../../navigation/RootNavigator';

import { COLORS } from '../../constants/colors';
import { DEMO_PHONES } from '../../mocks/rental';
import { useClothingItems } from '../../state/clothingStore';
import { findDemoUser, resetRentals, switchDemoUser, useRentalState } from '../../state/rentalStore';

import RoundImage from '../../components/common/RoundImage';

const IN_PROGRESS = ['accepted', 'handed-over', 'received', 'returned'];
const preparing = (message: string) => Alert.alert('준비 중', message);
// 010-0000-0001 → 010-****-0001
const maskPhone = (phone?: string) => phone?.replace(/-(\d{4})-/, '-****-') ?? '-';

/* 하단 탭 '마이' (Figma F. 마이페이지) */
export default function MyPageScreen({ navigation }: MainTabScreenProps<'MyPage'>) {
  const { bottom } = useSafeAreaInsets();
  const { currentUserId, rentals } = useRentalState();
  const clothes = useClothingItems();
  const me = findDemoUser(currentUserId);

  const mine = rentals.filter((rental) => rental.ownerId === currentUserId || rental.borrowerId === currentUserId);
  const stats = [
    { label: '등록한 옷', value: clothes.filter((cloth) => cloth.ownerId === currentUserId && !cloth.deleted).length },
    { label: '진행 중 거래', value: mine.filter((rental) => IN_PROGRESS.includes(rental.stage)).length },
    { label: '완료 거래', value: mine.filter((rental) => rental.stage === 'completed').length },
  ];

  // 마이 메뉴 이동은 아직 비활성. 화면이 연결되면 각 onPress를 이동으로 교체
  const menus = [
    { label: '내 등록 옷 관리', message: '내 등록 옷 관리는 곧 연결될 예정이에요.' },
    { label: '받은 신청', message: '받은 신청은 내 등록 옷 관리에서 확인할 수 있도록 연결될 예정이에요.' },
    { label: '알림', message: '알림은 서버 연동 후 사용할 수 있어요.' },
    { label: '로그아웃', message: '로그아웃은 로그인 연동 후 사용할 수 있어요.' },
    { label: '회원 탈퇴', message: '회원 탈퇴는 이후 제공될 예정이에요.', muted: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>마이</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: 110 + bottom }]}>
        <Pressable
          onPress={() => preparing('프로필 수정은 곧 연결될 예정이에요.')}
          accessibilityRole="button"
          accessibilityLabel="프로필 수정"
          style={styles.profile}
        >
          <RoundImage size={56} />
          <View style={styles.profileTexts}>
            <Text style={styles.name}>{me?.name ?? '-'}</Text>
            <Text style={styles.sub}>
              {me?.region.district ?? '-'} · {maskPhone(DEMO_PHONES[currentUserId])}
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
            <Pressable key={stat.label} style={styles.stat} accessibilityRole="button" onPress={() => stat.label === '등록한 옷' ? navigation.navigate('MyClothes') : navigation.navigate('MyTrades')}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.menus}>
          {menus.map((menu) => (
            <MenuRow key={menu.label} label={menu.label} muted={menu.muted} onPress={() => {
              if (menu.label === '내 등록 옷 관리') navigation.navigate('MyClothes');
              else if (menu.label === '받은 신청') navigation.navigate('ReceivedRequests');
              else preparing(menu.message);
            }} />
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
            <MenuRow label="받은 신청 바로가기" onPress={() => navigation.navigate('ReceivedRequests')} />
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
    </SafeAreaView>
  );
}

function MenuRow({ label, muted = false, onPress }: { label: string; muted?: boolean; onPress: () => void }) {
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
