import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS } from '../../constants/colors';

/* 회색 배경 안내 한 줄 (i 아이콘 · 문구) */
export default function InfoNote({ text }: { text: string }) {
  return (
    <View style={styles.note}>
      <Image source={require('../../../assets/icons/info.png')} style={styles.icon} resizeMode="contain" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bgGray,
  },

  icon: {
    width: 16,
    height: 16,
    marginTop: 1,
    tintColor: COLORS.textSub,
  },

  text: {
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18.85,
    color: COLORS.textSub,
    includeFontPadding: false,
  },
});
