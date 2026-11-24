import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
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
import PhotoViewer from '../../components/rental/PhotoViewer';
import { COLORS } from '../../constants/colors';
import { useClothingItems } from '../../state/clothingStore';
import { markPhotosReviewed, useRentalState } from '../../state/rentalStore';
import { photoRecordKey, useTradePhotos } from '../../state/tradePhotoStore';
import { formatDateTime } from '../../utils/formatDate';
import { getRentalCheckpoints } from '../../api/rental';
import { photoParts } from '../../api/clothingRegistration';
import type { RentalCheckpointResponse } from '../../types/rental';
import { isServerRentalId } from '../../utils/tradeStage';

type Props = NativeStackScreenProps<RootStackParamList, 'TradePhotoCompare'>;

const STAGE_TITLES = ['1단계 · 등록 시', '2단계 · 전달 직전', '3단계 · 수령', '4단계 · 반납'];

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

  // shortcut: 숫자 id는 서버 거래라 체크포인트 API로 4단계 사진을 받습니다, mock 제거 시 이 분기만 남깁니다
  const serverId = isServerRentalId(route.params.rentalId) ? Number(route.params.rentalId) : null;
  const [server, setServer] = useState<{ data?: RentalCheckpointResponse; error?: string }>({});

  useEffect(() => {
    if (serverId === null) return;
    let alive = true;
    getRentalCheckpoints(serverId)
      .then((data) => alive && setServer({ data }))
      .catch((error: Error) => alive && setServer({ error: error.message }));
    return () => {
      alive = false;
    };
  }, [serverId]);

  const tileSize = (width - SIDE_PADDING * 2 - GRID_GAP) / 2;

  if (serverId !== null) {
    if (!server.data) {
      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <Header type="back" title="사진 비교" onPressLeft={() => navigation.goBack()} />
          <Text style={styles.empty}>{server.error ?? '사진을 불러오고 있어요.'}</Text>
        </SafeAreaView>
      );
    }
    // 서버 사진 주소는 응답마다 새로 발급되고 잠시 뒤 만료됩니다
    const stages = server.data.stages.map((stage, index) => ({
      title: STAGE_TITLES[index],
      by: stage.takenBy === 'OWNER' ? '등록자' : '대여자',
      uri: stage.photos.find((photo) => photo.photoPart === photoParts[part])?.imageUrl,
      at: stage.takenAt ?? undefined,
    }));
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header type="back" title="사진 비교" onPressLeft={() => navigation.goBack()} />
        <CompareGrid
          stages={stages}
          part={part}
          tileSize={tileSize}
          onPart={setPart}
          onView={setViewing}
        />
        {viewing !== null && (
          <PhotoViewer
            uris={stages.map((stage) => stage.uri)}
            startIndex={viewing}
            onClose={() => setViewing(null)}
          />
        )}
      </SafeAreaView>
    );
  }

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
    {
      title: '1단계 · 등록 시',
      by: '등록자',
      uri: registered ?? (part === '전면' ? cloth.imageUrl : undefined),
      at: cloth.detail?.registeredAt,
    },
    { title: '2단계 · 전달 직전', by: '등록자', uri: handoff?.photos[part], at: handoff?.savedAt },
    { title: '3단계 · 수령', by: '대여자', uri: receipt?.photos[part], at: receipt?.savedAt },
    { title: '4단계 · 반납', by: '대여자', uri: returned?.photos[part], at: returned?.savedAt },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header type="back" title="사진 비교" onPressLeft={() => navigation.goBack()} />

      <CompareGrid
        stages={stages}
        part={part}
        tileSize={tileSize}
        onPart={setPart}
        onView={setViewing}
      />

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
          <DefaultButton
            title="문제 신고하기"
            onPress={() => navigation.navigate('TradeReport', { rentalId: rental.id })}
          />
        </View>
      </View>

      {viewing !== null && (
        <PhotoViewer
          uris={stages.map((stage) => stage.uri)}
          startIndex={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </SafeAreaView>
  );
}

type Stage = { title: string; by: string; uri?: string; at?: number | string };

function CompareGrid({
  stages,
  part,
  tileSize,
  onPart: setPart,
  onView: setViewing,
}: {
  stages: Stage[];
  part: PhotoPart;
  tileSize: number;
  onPart: (part: PhotoPart) => void;
  onView: (index: number) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.parts}>
        {PHOTO_PARTS.map((item) =>
          item === part ? (
            <ChipActiveButton key={item} title={item} onPress={() => setPart(item)} />
          ) : (
            <ChipButton key={item} title={item} onPress={() => setPart(item)} />
          ),
        )}
      </View>

      <View style={styles.grid}>
        {stages.map((stage, index) => (
          <View key={stage.title} style={[styles.cell, { width: tileSize }]}>
            <Pressable
              onPress={() => setViewing(index)}
              disabled={!stage.uri}
              accessibilityRole="button"
              accessibilityLabel={`${stage.title} 사진 크게 보기`}
            >
              <SquareImage
                size={tileSize}
                borderRadius={16}
                placeholder={
                  <Image
                    source={require('../../../assets/icons/camera-off.svg')}
                    style={styles.missingPhotoIcon}
                    contentFit="contain"
                  />
                }
                source={stage.uri ? { uri: stage.uri } : undefined}
              />
            </Pressable>
            <Text style={styles.stageTitle}>{stage.title}</Text>
            <Text style={styles.stageMeta}>
              {stage.uri
                ? `${stage.by} 촬영${stage.at ? ` · ${formatDateTime(new Date(stage.at))}` : ''}`
                : `${part} 사진 없음`}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
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
    gap: 6,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },

  cell: {
    gap: 4,
  },

  missingPhotoIcon: {
    width: 24,
    height: 24,
    transform: [{ translateX: 1 }, { translateY: 0.5 }],
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

  bottomCta: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
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
