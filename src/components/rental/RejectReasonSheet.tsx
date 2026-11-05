import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

import BottomSheet from '../bottomsheet/BottomSheet';
import RadioInputField from '../common/RadioInputField';
import AreaInputField from '../common/AreaInputField';
import CtaButton from '../common/CtaButton';
import CtaDisabledButton from '../common/CtaDisabledButton';

// 거절 사유 (선택지 4개 - 피그마 기준)
const REASONS = ['그 날짜엔 제가 입어야 해요', '옷 상태가 지금 빌려주기 어려워요', '거래 지역이 너무 멀어요', '기타 (직접 입력)'] as const;
const ETC = REASONS[3];

interface RejectReasonSheetProps {
  visible: boolean;
  onReject: (reason: string) => void;
  onClose: () => void;
}

export default function RejectReasonSheet({
  visible,
  onReject,
  onClose,
}: RejectReasonSheetProps) {
  const [reason, setReason] = useState<(typeof REASONS)[number] | null>(null);
  const [etcText, setEtcText] = useState('');

  // 다시 열면 처음부터 고르도록 초기화
  useEffect(() => {
    if (visible) {
      setReason(null);
      setEtcText('');
    }
  }, [visible]);

  const finalReason = reason === ETC ? etcText.trim() : reason;

  return (
    <BottomSheet
      visible={visible}
      title="거절하는 이유를 알려주세요"
      onClose={onClose}
      footer={
        finalReason ? (
          <CtaButton title="거절하기" onPress={() => onReject(finalReason)} />
        ) : (
          <CtaDisabledButton title="거절하기" />
        )
      }
    >
      <Text style={styles.description}>대여자에게 그대로 전달돼요</Text>

      <View style={styles.options}>
        {REASONS.map((item) => (
          <RadioInputField
            key={item}
            label={item}
            selected={reason === item}
            onPress={() => setReason(item)}
          />
        ))}

        {reason === ETC && (
          <AreaInputField
            label=""
            placeholder="입력해주세요"
            value={etcText}
            onChangeText={setEtcText}
            maxLength={200}
          />
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  description: {
    marginTop: -12,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.textPlaceholder,
    includeFontPadding: false,
  },

  options: {
    gap: 20,
  },
});
