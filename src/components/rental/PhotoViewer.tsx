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

const PHOTO_RATIO = 553 / 390;
const CHROME_HEIGHT = 126; // 헤더 56 + 페이지 점 영역 41 + 하단 여백 29

/* TRD-550 사진 비교 크게 보기. 좌우로 넘겨 1~4단계를 봅니다 */
export default function PhotoViewer({ uris, startIndex, onClose }: PhotoViewerProps) {
  const { width, height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const [page, setPage] = useState(startIndex);
  // 작은 화면에서는 페이지 점을 가리지 않게 높이를 줄입니다.
  const photoHeight = Math.min(width * PHOTO_RATIO, height - top - bottom - CHROME_HEIGHT);

  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <StatusBar style="light" />
      <View style={[styles.container, { paddingTop: top, paddingBottom: bottom + 29 }]}>
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
                <Image source={{ uri }} style={{ width, height: photoHeight }} resizeMode="cover" />
              ) : (
                <View style={[styles.empty, { width, height: photoHeight }]}>
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
    fontSize: 16,
    lineHeight: 23.2,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 33,
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
