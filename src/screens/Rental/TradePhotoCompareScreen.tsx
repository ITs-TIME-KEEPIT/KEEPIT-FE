import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import { PHOTO_PARTS, type PhotoPart } from '../../components/camera/PhotoCapture';
import ChipActiveButton from '../../components/common/ChipActiveButton';
import ChipButton from '../../components/common/ChipButton';
import CtaButton from '../../components/common/CtaButton';
import DefaultButton from '../../components/common/DefaultButton';
import Header from '../../components/common/Header';
import SquareImage from '../../components/common/SquareImage';
import InfoRow from '../../components/rental/InfoRow';
import PhotoViewer from '../../components/rental/PhotoViewer';
import { COLORS } from '../../constants/colors';
import { useClothingItems } from '../../state/clothingStore';
import { markPhotosReviewed, useRentalState } from '../../state/rentalStore';
import { photoRecordKey, useTradePhotos } from '../../state/tradePhotoStore';
import { formatDateTime, formatElapsed } from '../../utils/formatDate';

type Props = NativeStackScreenProps<RootStackParamList, 'TradePhotoCompare'>;

const GRID_GAP = 16;
const SIDE_PADDING = 20;

/* TRD-550 1~4단계를 같은 촬영 부위끼리 비교 */
export default function TradePhotoCompareScreen({ navigation, route }: Props) {
  const { width } = useWindowDimensions();
  const { currentUserId, rentals } = useRentalState();
  const clothes = useClothingItems();
  const records = useTradePhotos();
  const [part, setPart] = useState<PhotoPart>('전면');
  const [viewing, setViewing] = useState<number | null>(null);

  const rental = rentals.find((item) => item.id === route.params.rentalId);
  const cloth = clothes.find((item) => item.id === rental?.clothId);

  if (!rental || !cloth) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header type="back" title="사진 비교" onPressLeft={() => navigation.goBack()} />
        <Text style={styles.empty}>거래를 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }

  const handoff = records[photoRecordKey(rental.id, 'handoff')];
  const receipt = records[photoRecordKey(rental.id, 'receipt')];
  const returned = records[photoRecordKey(rental.id, 'return')];
  const registered = cloth.detail?.photos?.find((photo) => photo.part === part)?.uri;

  const stages = [
    { title: '1단계 · 등록 시', by: '등록자', uri: registered ?? (part === '전면' ? cloth.imageUrl : undefined), at: cloth.detail?.registeredAt },
    { title: '2단계 · 전달 직전', by: '등록자', uri: handoff?.photos[part], at: handoff?.savedAt },
    { title: '3단계 · 수령', by: '대여자', uri: receipt?.photos[part], at: receipt?.savedAt },
    { title: '4단계 · 반납', by: '대여자', uri: returned?.photos[part], at: returned?.savedAt },
  ];
  const elapsed = (from?: number, to?: number) => (from && to ? formatElapsed(to - from) : '-');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header type="back" title="사진 비교" onPressLeft={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.parts}>
          {PHOTO_PARTS.map((item) => (item === part
            ? <ChipActiveButton key={item} title={item} onPress={() => setPart(item)} />
            : <ChipButton key={item} title={item} onPress={() => setPart(item)} />))}
        </View>

        <View style={styles.grid}>
          {stages.map((stage, index) => (
            <View key={stage.title} style={styles.cell}>
              <Pressable
                onPress={() => setViewing(index)}
                disabled={!stage.uri}
                accessibilityRole="button"
                accessibilityLabel={`${stage.title} 사진 크게 보기`}
              >
                <SquareImage size={(width - SIDE_PADDING * 2 - GRID_GAP) / 2} source={stage.uri ? { uri: stage.uri } : undefined} />
              </Pressable>
              <Text style={styles.stageTitle}>{stage.title}</Text>
              <Text style={styles.stageMeta}>
                {stage.by} 촬영{stage.at ? ` · ${formatDateTime(new Date(stage.at))}` : ''}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.elapsed}>
          <Text style={styles.elapsedTitle}>단계 사이 경과 시간</Text>
          <InfoRow label="전달 → 수령" value={elapsed(handoff?.savedAt, receipt?.savedAt)} />
          <InfoRow label="수령 → 반납" value={elapsed(receipt?.savedAt, returned?.savedAt)} />
        </View>
      </ScrollView>

      <View style={styles.bottomCta}>
        {rental.ownerId === currentUserId && rental.stage === 'returned' && (
          <CtaButton
            title="다음"
            onPress={() => {
              markPhotosReviewed(rental.id);
              navigation.goBack();
            }}
          />
        )}
        <View style={styles.secondary}>
          <DefaultButton title="문제 신고하기" onPress={() => navigation.navigate('TradeReport', { rentalId: rental.id })} />
        </View>
      </View>

      {viewing !== null && (
        <PhotoViewer uris={stages.map((stage) => stage.uri)} startIndex={viewing} onClose={() => setViewing(null)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  empty: {
    padding: 20,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  body: {
    gap: 16,
    paddingTop: 10,
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 20,
  },

  parts: {
    flexDirection: 'row',
    gap: 8,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },

  cell: {
    gap: 4,
  },

  stageTitle: {
    marginTop: 9,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.text,
    includeFontPadding: false,
  },

  stageMeta: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    lineHeight: 17.4,
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  elapsed: {
    gap: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.bgLight,
  },

  elapsedTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    lineHeight: 20.3,
    color: COLORS.text,
    includeFontPadding: false,
  },

  bottomCta: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 8,
    backgroundColor: COLORS.white,
  },

  // DefaultButton이 alignSelf: 'flex-start'라 가로 정렬로 가운데 배치
  secondary: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 4,
  },
});
