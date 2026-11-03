import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';
import { formatDate } from '../../utils/formatDate';

import Popup from '../common/Popup';

interface HolidayShippingPopupProps {
  visible: boolean;
  holiday: { name: string; start: Date; end: Date; shippingDeadline: Date };
  arrivalDate: Date; // 예상 도착일 (받는 날)
  onConfirm: () => void; // 택배 유지
  onSwitchToDirect: () => void; // 직거래로 변경
}

/* RENT-410 연휴 택배 안내. 택배 기간이 연휴 14일 전 ~ 연휴 마지막 날에 걸치면 노출 */
export default function HolidayShippingPopup({
  visible,
  holiday,
  arrivalDate,
  onConfirm,
  onSwitchToDirect,
}: HolidayShippingPopupProps) {
  const rows = [
    { label: '연휴', value: `${formatDate(holiday.start)} ~ ${formatDate(holiday.end)}` },
    { label: '택배 접수 마감', value: `${formatDate(holiday.shippingDeadline)}까지`, alert: true },
    { label: '예상도착일', value: formatDate(arrivalDate) },
  ];

  return (
    <Popup
      visible={visible}
      title="연휴 택배 마감 일정을 확인해 보세요"
      description={`${holiday.name} 연휴 전후로는 택배사 접수 마감이 앞당겨지고 배송이 밀릴 수 있어요. 받는 날에 맞춰 도착하는지 꼭 확인해 주세요.`}
      primaryLabel="확인했어요"
      onPressPrimary={onConfirm}
      secondaryLabel="직거래로 바꿀게요"
      onPressSecondary={onSwitchToDirect}
      onClose={onConfirm}
    >
      <View style={styles.infoBox}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={[styles.value, row.alert && styles.valueAlert]}>{row.value}</Text>
          </View>
        ))}
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

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    lineHeight: 17.4,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  value: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    lineHeight: 17.4,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  valueAlert: {
    color: COLORS.alert,
  },
});
