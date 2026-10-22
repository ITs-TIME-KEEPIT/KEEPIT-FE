import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
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
import SecondaryButton from '../common/SecondaryButton';
import CtaButton from '../common/CtaButton';
import CtaDisabledButton from '../common/CtaDisabledButton';

const TABS = ['가격', '사이즈', '컬러'] as const;
type Tab = (typeof TABS)[number];

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
        <View style={styles.footer}>
          <SecondaryButton title="초기화" onPress={() => setDraft(INITIAL_FILTER)} style={styles.reset} />
          <View style={styles.submit}>
            {/* 0개일 때 비활성 여부는 디자인 확인 필요 */}
            {count > 0 ? (
              <CtaButton title={`${count}개 옷 보기`} onPress={apply} />
            ) : (
              <CtaDisabledButton title="0개 옷 보기" />
            )}
          </View>
        </View>
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
    borderBottomColor: COLORS.line,
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
    borderBottomColor: COLORS.primary,
  },

  tabText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0,
    color: COLORS.textPlaceholder,
    includeFontPadding: false,
  },

  tabTextActive: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  // 탭이 바뀌어도 시트 높이가 변하지 않도록 고정
  content: {
    height: 300,
  },

  footer: {
    flexDirection: 'row',
    gap: 8,
  },

  reset: {
    width: 104,
    height: 52,
  },

  submit: {
    flex: 1,
  },
});
