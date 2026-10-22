import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

import { COLORS as CLOTH_COLORS } from '../../constants/clothing';
import type { ColorKey } from '../../constants/clothing';

import ColorChip from './ColorChip';

interface ColorChipGroupProps {
  selected: ColorKey[];
  onChange: (next: ColorKey[]) => void;
}

export default function ColorChipGroup({
  selected,
  onChange,
}: ColorChipGroupProps) {
  return (
    <View style={styles.grid}>
      {CLOTH_COLORS.map((color) => (
        <View key={color.key} style={styles.cell}>
          <ColorChip
            color={color}
            selected={selected.includes(color.key)}
            onPress={() =>
              onChange(
                selected.includes(color.key)
                  ? selected.filter((key) => key !== color.key)
                  : [...selected, color.key],
              )
            }
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
  },

  // 한 줄에 5개
  cell: {
    width: '20%',
    alignItems: 'center',
  },
});

/*
ColorChipGroup 사용법 - 최종 배포 시 주석은 삭제 예정

컬러 목록 5열 그리드, 다중 선택. 홈 상세 필터와 옷 등록(REG-320)에서 같이 사용.

import ColorChipGroup from '../../components/clothing/ColorChipGroup';

const [colors, setColors] = useState<ColorKey[]>([]);

<ColorChipGroup selected={colors} onChange={setColors} />
*/
