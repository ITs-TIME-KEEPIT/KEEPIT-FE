import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';
import Badge, { BadgeTone } from '../common/Badge';
import SquareImage from '../common/SquareImage';

interface ClothCardProps {
  imageUrl?: string;
  title: string;
  region: string;
  category: string;
  size: string;
  price: number;
  badges?: { label: string; tone?: BadgeTone }[];
  onPress?: () => void;
}

export default function ClothCard({
  imageUrl,
  title,
  region,
  category,
  size,
  price,
  badges = [],
  onPress,
}: ClothCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={styles.container}
    >
      <SquareImage
        source={imageUrl ? { uri: imageUrl } : undefined}
        size={108}
      />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[region, category, size].join(' · ')}
        </Text>
        <Text style={styles.price}>
          {price.toLocaleString('ko-KR')}원
        </Text>

        {badges.length > 0 && (
          <View style={styles.badges}>
            {badges.map((badge) => (
              <Badge
                key={badge.label}
                label={badge.label}
                tone={badge.tone}
              />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,

    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,

    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },

  info: {
    flex: 1,
    gap: 4,
  },

  title: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 16,
    lineHeight: 22.4,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  meta: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18.2,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  price: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    lineHeight: 22.4,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});

/* 
ClothCard 사용법 - 최종 배포 시 주석은 삭제 예정

옷 목록 아이템. 하단 구분선이 있어 리스트로 이어 붙여서 사용 가능.

import ClothCard from '../../components/clothing/ClothCard';

<ClothCard
  imageUrl="https://..."
  title="하객룩 네이비 원피스"
  region="마포구"
  category="원피스"
  size="M"
  price={25000}
  badges={[
    { label: '세탁 포함' },
    { label: '택배 가능', tone: 'gray' },
  ]}
  onPress={() => navigation.navigate('Detail', { id })}
/>
*/