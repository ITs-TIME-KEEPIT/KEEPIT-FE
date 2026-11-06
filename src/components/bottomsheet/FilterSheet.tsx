import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';
import { INITIAL_FILTER } from '../../types/filter';
import type { DetailFilter } from '../../types/filter';

import BottomSheet from './BottomSheet';
import PriceTab from './filter/PriceTab';
import SizeTab from './filter/SizeTab';
import ColorTab from './filter/ColorTab';
import CtaButton from '../common/CtaButton';
import CtaDisabledButton from '../common/CtaDisabledButton';

const TABS = ['가격', '사이즈', '컬러'] as const;
type Tab = (typeof TABS)[number];

const TAB_HEADINGS: Record<Tab, { title: string; hint: string }> = {
  가격: { title: '대여료', hint: '직거래 기준, 택배비 제외' },
  사이즈: { title: '사이즈', hint: '여러개 선택할 수 있어요' },
  컬러: { title: '컬러', hint: '여러개 선택할 수 있어요' },
};

interface FilterSheetProps {
  visible: boolean;
  value: DetailFilter; // 홈에 적용된 필터
  countFor: (filter: DetailFilter) => number; // 실시간 개수 계산
  onApply: (filter: DetailFilter) => void;
  onClose: () => void;
}

export default function FilterSheet({
  visible,
  value,
  countFor,
  onApply,
  onClose,
}: FilterSheetProps) {
  const [tab, setTab] = useState<Tab>('가격');
  const [draft, setDraft] = useState(value);

  // 열릴 때마다 적용된 필터를 복사해서 편집 (닫으면 draft는 버려짐)
  useEffect(() => {
    if (visible) {
      setDraft(value);
      setTab('가격');
    }
  }, [visible]);

  const count = countFor(draft);

  // 가격 조건 표시 방법은 디자인 확인 전이라 생략
  const tabLabel = (t: Tab) => {
    const n = t === '사이즈' ? draft.sizes.length : t === '컬러' ? draft.colors.length : 0;
    return n > 0 ? `${t} ${n}` : t;
  };

  // 초기화 버튼이 탭 제목 옆에 있어 현재 탭의 조건만 되돌림
  const resetTab = () =>
    setDraft((d) => ({
      ...d,
      ...(tab === '가격' && { price: INITIAL_FILTER.price }),
      ...(tab === '사이즈' && { sizes: INITIAL_FILTER.sizes }),
      ...(tab === '컬러' && { colors: INITIAL_FILTER.colors }),
    }));

  const apply = () => {
    const { min, max } = draft.price;
    // 입력칸에서 바로 버튼을 눌러 blur 처리가 안 됐을 때 대비
    onApply(max !== null && min > max ? { ...draft, price: { min: max, max: min } } : draft);
  };

  return (
    <BottomSheet
      visible={visible}
      title="필터"
      onClose={onClose}
      footer={
        // 0개일 때 비활성 여부는 디자인 확인 필요
        count > 0 ? (
          <CtaButton title={`${count}개 옷 보기`} onPress={apply} />
        ) : (
          <CtaDisabledButton title="0개 옷 보기" />
        )
      }
    >
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            accessibilityRole="tab"
            accessibilityState={{ selected: t === tab }}
            style={[styles.tab, t === tab && styles.tabActive]}
          >
            <Text style={t === tab ? styles.tabTextActive : styles.tabText}>
              {tabLabel(t)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.content}>
        <View style={styles.heading}>
          <View style={styles.headingText}>
            <Text style={styles.headingTitle}>{TAB_HEADINGS[tab].title}</Text>
            <Text style={styles.headingHint}>{TAB_HEADINGS[tab].hint}</Text>
          </View>
          <Pressable
            onPress={resetTab}
            accessibilityRole="button"
            accessibilityLabel={`${tab} 초기화`}
            style={styles.reset}
          >
            <Image source={require('../../../assets/icons/refresh.png')} style={styles.resetIcon} resizeMode="contain" />
          </Pressable>
        </View>

        {tab === '가격' && (
          <PriceTab price={draft.price} onChange={(price) => setDraft((d) => ({ ...d, price }))} />
        )}
        {tab === '사이즈' && (
          <SizeTab sizes={draft.sizes} onChange={(sizes) => setDraft((d) => ({ ...d, sizes }))} />
        )}
        {tab === '컬러' && (
          <ColorTab colors={draft.colors} onChange={(colors) => setDraft((d) => ({ ...d, colors }))} />
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgGray,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    // 밑줄 자리를 미리 잡아 탭 전환 시 높이가 변하지 않도록
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },

  tabActive: {
    borderBottomColor: COLORS.text,
  },

  tabText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    lineHeight: 21.75,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  tabTextActive: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    lineHeight: 21.75,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  // 탭이 바뀌어도 시트 높이가 변하지 않도록 고정
  content: {
    height: 300,
    gap: 12,
  },

  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headingText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  headingTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    lineHeight: 26.1,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  headingHint: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    lineHeight: 17.4,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  reset: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgGray,
    borderRadius: 18,
  },

  resetIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.text,
  },
});
