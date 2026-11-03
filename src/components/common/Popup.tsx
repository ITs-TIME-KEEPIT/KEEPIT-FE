import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface PopupProps {
  visible: boolean;
  title: string;
  description?: string;
  children?: React.ReactNode; // 설명 아래 추가 내용 (안내 박스 등)
  primaryLabel: string;
  onPressPrimary: () => void;
  secondaryLabel?: string;
  onPressSecondary?: () => void;
  onClose: () => void; // 안드로이드 뒤로가기
}

/* 가운데 뜨는 안내 팝업 (제목 · 설명 · 주 버튼 · 보조 텍스트 버튼) */
export default function Popup({
  visible,
  title,
  description,
  children,
  primaryLabel,
  onPressPrimary,
  secondaryLabel,
  onPressSecondary,
  onClose,
}: PopupProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.dim}>
        <View style={styles.popup}>
          <Text style={styles.title}>
            {title}
          </Text>

          {description && (
            <Text style={styles.description}>
              {description}
            </Text>
          )}

          {children}

          <View style={styles.actions}>
            <Pressable
              onPress={onPressPrimary}
              accessibilityRole="button"
              style={styles.primaryButton}
            >
              <Text style={styles.primaryLabel}>
                {primaryLabel}
              </Text>
            </Pressable>

            {secondaryLabel && onPressSecondary && (
              <Pressable
                onPress={onPressSecondary}
                accessibilityRole="button"
                hitSlop={8}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryLabel}>
                  {secondaryLabel}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  popup: {
    width: '100%',
    maxWidth: 318,
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },

  title: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    lineHeight: 26.1,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  description: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
    paddingTop: 6,
  },

  primaryButton: {
    width: '100%',
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },

  primaryLabel: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    lineHeight: 23.2,
    letterSpacing: 0,
    color: COLORS.white,
    includeFontPadding: false,
  },

  secondaryButton: {
    paddingTop: 8,
  },

  secondaryLabel: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    lineHeight: 23.2,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },
});
