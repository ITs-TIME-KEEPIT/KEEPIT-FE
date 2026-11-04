import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import { COLORS } from '../../constants/colors';
import type { TradeMethod } from '../../types/rental';
import { MOCK_HOLIDAY, MOCK_RENTAL_CLOTH } from '../../mocks/rental';
import { formatDate } from '../../utils/formatDate';

import Header from '../../components/common/Header';
import DateRangeCalendar from '../../components/common/DateRangeCalendar';
import RadioInputField from '../../components/common/RadioInputField';
import CtaButton from '../../components/common/CtaButton';
import CtaDisabledButton from '../../components/common/CtaDisabledButton';
import ItemSummary from '../../components/rental/ItemSummary';
import InfoRow from '../../components/rental/InfoRow';
import HolidayShippingPopup from '../../components/rental/HolidayShippingPopup';

type Props = NativeStackScreenProps<RootStackParamList, 'RentalRequest'>;

const MAX_RENTAL_DAYS = 7;
const SHIPPING_BUFFER_DAYS = 2; // 택배는 받는 날 앞뒤로 배송 기간
const HOLIDAY_NOTICE_DAYS = 14; // 연휴 시작 14일 전부터 안내

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const countDays = (start: Date, end: Date) =>
  Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;

// 배송 기간을 포함한 대여 기간이 연휴 14일 전 ~ 연휴 마지막 날과 겹치는지
const overlapsHoliday = (start: Date, end: Date) =>
  addDays(start, -SHIPPING_BUFFER_DAYS) <= MOCK_HOLIDAY.end &&
  addDays(end, SHIPPING_BUFFER_DAYS) >= addDays(MOCK_HOLIDAY.start, -HOLIDAY_NOTICE_DAYS);

export default function RentalRequestScreen({ navigation }: Props) {
  // shortcut: 옷 상세 연동 전이라 clothId와 무관하게 시연용 옷을 표시, 상세 연동 시 clothId로 조회
  const cloth = MOCK_RENTAL_CLOTH;
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [method, setMethod] = useState<TradeMethod | null>(null);
  // 연휴 택배 안내는 같은 신청에서 한 번만 노출
  const [holidayNoticeShown, setHolidayNoticeShown] = useState(false);
  const [holidayPopupOpen, setHolidayPopupOpen] = useState(false);

  const methods: TradeMethod[] = cloth.shippingAvailable ? ['직거래', '택배'] : ['직거래'];

  // 대여 가능 기간 밖이거나 이미 예약된 날은 선택 불가
  const isReserved = (date: Date) =>
    date < cloth.availableFrom ||
    date > cloth.availableTo ||
    cloth.reservedDates.some((d) => d.getTime() === date.getTime());

  const canNext = !!start && !!end && !!method;

  const goToConfirm = (selected: TradeMethod) => {
    if (!start || !end) return;
    navigation.navigate('RentalConfirm', {
      clothId: cloth.id,
      start: start.getTime(),
      end: end.getTime(),
      method: selected,
    });
  };

  const onPressNext = () => {
    if (!start || !end || !method) return;
    if (method === '택배' && !holidayNoticeShown && overlapsHoliday(start, end)) {
      setHolidayNoticeShown(true);
      setHolidayPopupOpen(true);
      return;
    }
    goToConfirm(method);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header type="back" title="대여 신청" onPressLeft={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <ItemSummary
          title={cloth.title}
          price={cloth.price}
          ownerNickname={cloth.ownerNickname}
          region={cloth.region}
        />

        <View style={styles.section}>
          <View style={styles.titleGroup}>
            <Text style={styles.sectionTitle}>언제 빌릴까요?</Text>
            <Text style={styles.sectionDescription}>
              받는 날부터 돌려주는 날까지 골라주세요 (최대 {MAX_RENTAL_DAYS}일)
            </Text>
          </View>

          <DateRangeCalendar
            start={start}
            end={end}
            onChange={(s, e) => {
              setStart(s);
              setEnd(e);
            }}
            isReserved={isReserved}
            maxDays={MAX_RENTAL_DAYS}
          />
        </View>

        <View style={styles.dateSummary}>
          <InfoRow label="받는 날" value={start ? formatDate(start) : '-'} />
          <InfoRow
            label="돌려주는 날"
            value={start && end ? `${formatDate(end)} · ${countDays(start, end)}일` : '-'}
          />
        </View>

        <Text style={styles.sectionTitle}>어떻게 주고받을까요?</Text>

        <View style={styles.methods}>
          {methods.map((item) => (
            <RadioInputField
              key={item}
              label={item === '직거래' ? `직거래 · ${cloth.region}` : item}
              selected={method === item}
              onPress={() => setMethod(item)}
            />
          ))}
        </View>

        <View style={styles.note}>
          <Image
            source={require('../../../assets/icons/info.png')}
            style={styles.noteIcon}
            resizeMode="contain"
          />
          <Text style={styles.noteText}>
            택배를 고르면 받는 날 앞뒤로 2일씩 배송 기간이 자동으로 막혀요. 반납 택배비는 빌린 사람이 내요
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomCta}>
        {canNext ? (
          <CtaButton title="다음" onPress={onPressNext} />
        ) : (
          <CtaDisabledButton title="다음" />
        )}
      </View>

      {start && (
        <HolidayShippingPopup
          visible={holidayPopupOpen}
          holiday={MOCK_HOLIDAY}
          arrivalDate={start}
          onConfirm={() => {
            setHolidayPopupOpen(false);
            goToConfirm('택배');
          }}
          onSwitchToDirect={() => {
            setHolidayPopupOpen(false);
            setMethod('직거래');
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  scrollView: {
    flex: 1,
  },

  body: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },

  section: {
    gap: 16,
  },

  titleGroup: {
    gap: 2,
  },

  sectionTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    lineHeight: 26.1,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  sectionDescription: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  dateSummary: {
    padding: 16,
    gap: 6,
    borderRadius: 8,
    backgroundColor: COLORS.bgLight,
  },

  methods: {
    gap: 12,
  },

  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bgGray,
  },

  noteIcon: {
    width: 16,
    height: 16,
    marginTop: 1,
    tintColor: COLORS.textSub,
  },

  noteText: {
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18.85,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  bottomCta: {
    width: '100%',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.white,
  },
});
