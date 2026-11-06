import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

import BottomSheet from '../bottomsheet/BottomSheet';
import AreaInputField from '../common/AreaInputField';
import CtaButton from '../common/CtaButton';
import CtaDisabledButton from '../common/CtaDisabledButton';
import RadioInputField from '../common/RadioInputField';
import InfoNote from './InfoNote';

const REASONS = ['일정이 바뀌었어요', '상대방과 연락이 안 돼요', '기타 (직접 입력)'] as const;
const ETC = REASONS[2];

interface CancelReasonSheetProps {
  visible: boolean;
  onCancel: (reason: string) => void;
  onClose: () => void;
}

/* RENT-450 수락 후 ~ 전달 전 거래 취소. 사유 필수 */
export default function CancelReasonSheet({
  visible,
  onCancel,
  onClose,
}: CancelReasonSheetProps) {
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
      title="거래를 취소할까요?"
      onClose={onClose}
      footer={
        finalReason ? (
          <CtaButton title="거래취소" onPress={() => onCancel(finalReason)} />
        ) : (
          <CtaDisabledButton title="거래취소" />
        )
      }
    >
      <Text style={styles.description}>상대방에게 취소 사유가 전달되고, 해당 기간 예약이 풀려요</Text>

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
            placeholder="취소 사유를 입력해주세요"
            value={etcText}
            onChangeText={setEtcText}
            maxLength={200}
          />
        )}
      </View>

      <InfoNote text="옷을 전달한 뒤에는 앱에서 취소할 수 없어요. 문제가 생기면 문제 신고를 이용해주세요" />
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
