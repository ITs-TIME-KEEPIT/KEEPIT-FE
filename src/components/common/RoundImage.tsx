
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface RoundImageProps {
  source?: ImageSourcePropType;
  size?: number;
  placeholder?: string;
}

export default function RoundImage({
  source,
  size = 64,
  placeholder = 'Aa',
}: RoundImageProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={[
            styles.image,
            { borderRadius: size / 2 },
          ]}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.placeholder}>
          {placeholder}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,

    backgroundColor: COLORS.border,
    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  placeholder: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    lineHeight: 15.4,
    letterSpacing: 0,
    color: COLORS.white,
    includeFontPadding: false,
  },

  image: {
    width: '100%',
    height: '100%',
  },
});
