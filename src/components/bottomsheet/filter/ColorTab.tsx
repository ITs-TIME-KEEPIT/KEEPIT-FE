import React from 'react';

import type { ColorKey } from '../../../constants/clothing';

import ColorChipGroup from '../../clothing/ColorChipGroup';

interface ColorTabProps {
  colors: ColorKey[];
  onChange: (colors: ColorKey[]) => void;
}

export default function ColorTab({
  colors,
  onChange,
}: ColorTabProps) {
  return <ColorChipGroup selected={colors} onChange={onChange} />;
}
