import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';

import { COLORS } from '../../constants/colors';

interface SquareImageProps {
  source?: ImageSourcePropType;
  size?: number;
  borderRadius?: number;
  placeholder?: React.ReactNode;
}

export default function SquareImage({
  source,
  size = 64,
  borderRadius = 12,
  placeholder = <Text style={styles.placeholder}>Image</Text>,
}: SquareImageProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
        },
      ]}
    >
      {source ? <Image source={source} style={styles.image} resizeMode="cover" /> : placeholder}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,

    backgroundColor: COLORS.bgGray,
    borderWidth: 1,
    borderColor: COLORS.border,

    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  placeholder: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 17.4,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  image: {
    width: '100%',
    height: '100%',
  },
});
