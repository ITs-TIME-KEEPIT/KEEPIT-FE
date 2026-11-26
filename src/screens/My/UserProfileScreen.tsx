import React, { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { COLORS } from '../../constants/colors';

import Header from '../../components/common/Header';
import RoundImage from '../../components/common/RoundImage';
import ClothCard from '../../components/clothing/ClothCard';
import Keepee from '../../components/common/Keepee';

import { useClothingItems } from '../../state/clothingStore';
import { findDemoUser, useRentalState } from '../../state/rentalStore';
import { hasActiveTrade } from '../../utils/myClothes';
import { clothBadges } from '../../utils/filterClothItems';

type Tab = 'available' | 'unavailable';

/* 다른 사람 프로필 (Figma A. 프로필) */
export default function UserProfileScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'UserProfile'>) {
  const { userId } = route.params;
  const { rentals } = useRentalState();
  const clothes = useClothingItems();
  const [tab, setTab] = useState<Tab>('available');
  const user = findDemoUser(userId);

  const owned = clothes.filter((cloth) => cloth.ownerId === userId && !cloth.deleted);
  const unavailable = owned.filter((cloth) => cloth.hidden || hasActiveTrade(rentals, cloth.id));
  const available = owned.filter((cloth) => !unavailable.includes(cloth));
  const list = tab === 'available' ? available : unavailable;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'available', label: `대여 가능 ${available.length}` },
    { key: 'unavailable', label: `대여 중지·거래 중 ${unavailable.length}` },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header type="back" title="프로필" onPressLeft={() => navigation.goBack()} />

      {/* 프로필 정보는 스크롤되고 탭은 상단에 고정 */}
      <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={styles.scroll}>
        <View style={styles.profile}>
          <RoundImage size={64} source={user?.photoUri ? { uri: user.photoUri } : undefined} />
          <View style={styles.profileTexts}>
            <Text style={styles.name}>{user?.name ?? '등록자'}</Text>
            {user && (
              <Text style={styles.sub}>
                {user.region.district} · {user.joinedMonth} 가입
              </Text>
            )}
          </View>
        </View>

        {/* 고정 헤더는 스타일이 덮어써져서 가로 줄을 한 번 더 감쌉니다 */}
        <View style={styles.tabsSticky}>
          <View style={styles.tabs}>
            {tabs.map((item) => {
              const active = item.key === tab;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setTab(item.key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={[styles.tab, active && styles.tabActive]}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {list.length === 0 ? (
          <View style={styles.empty}>
            <Keepee motion="idle" style={styles.character} />
            <Text style={styles.emptyTitle}>
              {owned.length === 0
                ? '아직 등록된 옷이 없어요'
                : tab === 'available'
                  ? '지금 대여 가능한 옷이 없어요'
                  : '대여 중지·거래 중인 옷이 없어요'}
            </Text>
            {owned.length === 0 && (
              <Text style={styles.emptySub}>첫 번째 옷을 등록하고 대여를 시작해 보세요.</Text>
            )}
          </View>
        ) : (
          list.map((cloth) => {
            const trading = hasActiveTrade(rentals, cloth.id);
            return (
              <ClothCard
                key={cloth.id}
                imageUrl={cloth.imageUrl}
                title={cloth.title}
                region={tab === 'available' ? cloth.region : ''}
                category={cloth.category}
                size={cloth.size}
                date={cloth.detail?.postedLabel}
                price={cloth.price}
                badges={tab === 'available' ? clothBadges(cloth) : []}
                status={
                  tab === 'available'
                    ? undefined
                    : trading
                      ? { label: '거래 중', tone: 'alert' }
                      : { label: '대여 중지', tone: 'gray' }
                }
                muted={tab === 'unavailable' && !trading}
                onPress={() => navigation.navigate('ClothDetail', { clothId: cloth.id })}
              />
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  scroll: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },

  profileTexts: {
    flex: 1,
    gap: 2,
  },

  name: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    lineHeight: 26.1,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  sub: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18.85,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  tabsSticky: {
    paddingTop: 8,
    backgroundColor: COLORS.white,
  },

  tabs: {
    flexDirection: 'row',
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.text,
  },

  tabText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    lineHeight: 21.75,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  tabTextActive: {
    fontFamily: 'Pretendard-SemiBold',
    color: COLORS.text,
  },

  // Figma: 탭 아래 목록 영역 상단에서 144px
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 144,
    paddingHorizontal: 20,
  },

  character: {
    width: 90,
    height: 98,
    marginBottom: 10,
  },

  emptyTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    lineHeight: 23.2,
    letterSpacing: 0,
    color: COLORS.text,
    textAlign: 'center',
    includeFontPadding: false,
  },

  emptySub: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.textSub,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
