import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';
import type { DateRange } from '../../types/filter';

import BottomSheet from './BottomSheet';
import DateRangeCalendar from '../common/DateRangeCalendar';
import CtaButton from '../common/CtaButton';
import CtaDisabledButton from '../common/CtaDisabledButton';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const formatDate = (date: Date) =>
  `${date.getMonth() + 1}.${date.getDate()} (${WEEKDAYS[date.getDay()]})`;

interface DateRangeSheetProps {
  visible: boolean;
  value: DateRange;
  onApply: (range: DateRange) => void;
  onClose: () => void;
}

export default function DateRangeSheet({
  visible,
  value,
  onApply,
  onClose,
}: DateRangeSheetProps) {
  const [start, setStart] = useState<Date | null>(value?.start ?? null);
  const [end, setEnd] = useState<Date | null>(value?.end ?? null);

  // 열릴 때마다 적용된 기간을 복사해서 편집 (닫으면 버려짐)
  useEffect(() => {
    if (visible) {
      setStart(value?.start ?? null);
      setEnd(value?.end ?? null);
    }
  }, [visible]);

  const summary = !start
    ? '받는 날을 선택해주세요'
    : `받는 날 ${formatDate(start)} ~ ${end ? `돌려주는 날 ${formatDate(end)}` : '돌려주는 날을 선택해주세요'}`;

  return (
    <BottomSheet
      visible={visible}
      title="언제 빌릴까요?"
      onClose={onClose}
      footer={
        start && end ? (
          <CtaButton title="이 날짜로 보기" onPress={() => onApply({ start, end })} />
        ) : (
          <CtaDisabledButton title="이 날짜로 보기" />
        )
      }
    >
      {/* 열릴 때마다 새로 그려서 달력이 받는 날이 있는 달부터 보이도록 */}
      {visible && (
        <DateRangeCalendar
          start={start}
          end={end}
          onChange={(s, e) => {
            setStart(s);
            setEnd(e);
          }}
        />
      )}

      <Text style={styles.summary}>
        {summary}
      </Text>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  summary: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.primary,
    includeFontPadding: false,
  },
});