import React from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../constants/colors';

interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function BottomSheet({
  visible,
  title,
  onClose,
  children,
  footer,
}: BottomSheetProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="닫기"
          style={styles.dim}
        />

        <View style={[styles.sheet, { paddingBottom: 24 + bottom }]}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={8}
            >
              <Image
                source={require('../../../assets/icons/x.png')}
                style={styles.icon}
                resizeMode="contain"
              />
            </Pressable>
          </View>

          {children}
          {footer}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  dim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  sheet: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
    backgroundColor: COLORS.white,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 18,
    lineHeight: 25.2,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  icon: {
    width: 24,
    height: 24,
    tintColor: COLORS.text,
  },
});

/*
BottomSheet 사용법 - 최종 배포 시 주석은 삭제 예정

아래에서 올라오는 시트 틀 (dim + 흰 패널 + 제목 행). dim과 ✕를 누르면 onClose.

import BottomSheet from '../../components/bottomSheet/BottomSheet';

<BottomSheet
  visible={open}
  title="필터"
  onClose={() => setOpen(false)}
  footer={<CtaButton title="적용" onPress={...} />}
>
  ...내용
</BottomSheet>
*/
