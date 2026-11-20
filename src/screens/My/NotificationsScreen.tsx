import React, { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, Image, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';
import { MOCK_NOTIFICATIONS } from '../../mocks/notifications';

// shortcut: 읽음 표시를 앱 실행 중에만 기억, 알림 API 연동 시 서버 읽음 처리로 교체
let savedNotifications = MOCK_NOTIFICATIONS;
const saveNotifications = (next: typeof MOCK_NOTIFICATIONS) => {
  savedNotifications = next;
};

/* 알림함 (Figma D. 알림함). 안 읽은 알림은 파란 배경 */
export default function NotificationsScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Notifications'>) {
  const [notifications, setNotifications] = useState(savedNotifications);

  const markRead = (id: string) => {
    const next = notifications.map((item) => (item.id === id ? { ...item, read: true } : item));
    saveNotifications(next);
    setNotifications(next);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header type="back" title="알림" onPressLeft={() => navigation.goBack()} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={notifications.length ? undefined : styles.emptyContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => markRead(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: !item.read }}
            style={[styles.noti, !item.read && styles.notiUnread]}
          >
            <View style={styles.iconCircle}>
              <Image
                source={require('../../../assets/icons/bell.png')}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.texts}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>{item.timeLabel}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.body}>아직 받은 알림이 없어요</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  noti: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    backgroundColor: COLORS.white,
  },

  notiUnread: {
    backgroundColor: COLORS.primaryLight,
  },

  iconCircle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 18,
    backgroundColor: COLORS.white,
  },

  icon: {
    width: 20,
    height: 20,
    tintColor: COLORS.primary,
  },

  texts: {
    flex: 1,
    gap: 2,
  },

  title: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    lineHeight: 21.75,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  body: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  time: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18.85,
    letterSpacing: 0,
    color: COLORS.textPlaceholder,
    includeFontPadding: false,
  },

  emptyContent: {
    flexGrow: 1,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
