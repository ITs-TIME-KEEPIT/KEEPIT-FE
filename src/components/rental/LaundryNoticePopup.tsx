import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';
import type { LaundryNotice } from '../../types/rental';

import Popup from '../common/Popup';
import InfoRow from './InfoRow';

interface LaundryNoticePopupProps {
  notice: LaundryNotice;
  dueDate: string; // 돌려주는 날 (11.16 (월))
  onConfirm: () => void;
  onPressSms?: () => void; // 상대 번호가 없으면 문자 버튼을 숨김
  onClose: () => void;
}

/* TRD-510·520 세탁 주체가 빌린 사람인 거래의 세탁 안내 */
export default function LaundryNoticePopup({
  notice,
  dueDate,
  onConfirm,
  onPressSms,
  onClose,
}: LaundryNoticePopupProps) {
  const handoff = notice === 'handoff';

  return (
    <Popup
      visible
      title={handoff ? '빌린 사람이 세탁해서 돌려줘요' : '돌려줄 때 세탁해서 보내주세요'}
      description={handoff
        ? '이 옷은 기본으로 드라이클리닝해서 돌려받아요.\n손세탁만 되거나 맡기면 안 되는 소재라면, 옷을 건네기 전에 문자로 세탁 방법을 미리 알려주세요.'
        : '이 옷은 빌린 사람이 세탁해서 돌려주는 옷이에요. 기본은 드라이클리닝이에요. 옷에 따라 세탁 방법이 다를 수 있으니, 등록자에게 문자로 물어보세요.'}
      primaryLabel="확인했어요"
      onPressPrimary={onConfirm}
      secondaryLabel={handoff ? '빌린 사람에게 문자 보내기' : '등록자에게 문자 보내기'}
      onPressSecondary={onPressSms}
      onClose={onClose}
    >
      <View style={styles.infoBox}>
        <InfoRow label="세탁하는 사람" value={handoff ? '빌린 사람' : '나 (빌린 사람)'} />
        <InfoRow label="기본 세탁 방법" value="드라이클리닝" highlight />
        <InfoRow label="반납 때" value={handoff ? '세탁 후 사진 필수' : `${dueDate}까지`} />
      </View>
    </Popup>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    width: '100%',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.bgLight,
  },
});
