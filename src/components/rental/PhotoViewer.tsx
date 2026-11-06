import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../constants/colors';

interface PhotoViewerProps {
  uris: (string | undefined)[]; // 촬영하지 않은 단계는 빈 칸으로 보여줍니다
  startIndex: number;
  onClose: () => void;
}

/* TRD-550 사진 비교 크게 보기. 좌우로 넘겨 1~4단계를 봅니다 */
export default function PhotoViewer({ uris, startIndex, onClose }: PhotoViewerProps) {
  const { width } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const [page, setPage] = useState(startIndex);

  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <StatusBar style="light" />
      <View style={[styles.container, { paddingTop: top, paddingBottom: bottom + 24 }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="크게 보기 닫기" hitSlop={10}>
            <Image source={require('../../../assets/icons/x.png')} style={styles.close} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: startIndex * width, y: 0 }}
          onMomentumScrollEnd={(event) => setPage(Math.round(event.nativeEvent.contentOffset.x / width))}
        >
          {uris.map((uri, index) => (
            <View key={index} style={[styles.page, { width }]}>
              {uri ? (
                <Image source={{ uri }} style={{ width, height: width }} resizeMode="contain" />
              ) : (
                <View style={[styles.empty, { width, height: width }]}>
                  <Text style={styles.emptyText}>Image</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {uris.map((_, index) => (
            <View key={index} style={[styles.dot, index === page && styles.dotActive]} />
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },

  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  close: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },

  page: {
    justifyContent: 'center',
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgGray,
  },

  emptyText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 20,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 16,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.textSub,
  },

  dotActive: {
    backgroundColor: COLORS.white,
  },
});
