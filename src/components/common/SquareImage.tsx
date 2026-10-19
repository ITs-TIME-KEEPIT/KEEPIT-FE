
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';

import { COLORS } from '../../constants/colors';

interface SquareImageProps {
  source?: ImageSourcePropType;
  size?: number;
}

export default function SquareImage({
  source,
  size = 64,
}: SquareImageProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.placeholder}>
          Image
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,

    backgroundColor: COLORS.bgGray,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  placeholder: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    lineHeight: 15.4,
    letterSpacing: 0,
    color: COLORS.textPlaceholder,
    includeFontPadding: false,
  },

  image: {
    width: '100%',
    height: '100%',
  },
});
