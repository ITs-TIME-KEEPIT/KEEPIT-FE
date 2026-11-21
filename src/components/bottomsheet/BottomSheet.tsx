import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  Keyboard,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
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
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    // iOS는 키보드가 움직이기 전에 알려주는 will 이벤트가 있어 여백이 함께 바뀜
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', () =>
      setKeyboardOpen(true),
    );
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () =>
      setKeyboardOpen(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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

        {/* Figma: 마지막 요소는 화면 맨 아래에서 32, 키보드가 열리면 키보드 위 24 */}
        <View style={[styles.sheet, { paddingBottom: keyboardOpen ? 24 : 32 }]}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
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
    justifyContent: 'flex-end',
  },

  // 시트 뒤까지 덮어야 둥근 모서리 바깥도 어둡게 보임
  dim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.dim,
  },

  sheet: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  handle: {
    alignSelf: 'center',
    width: 52,
    height: 4,
    marginBottom: -4, // 시트 gap(16)에서 손잡이~제목 간격을 시안의 12로 맞춤
    borderRadius: 2,
    backgroundColor: COLORS.textPlaceholder,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    lineHeight: 26.1,
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
