import { useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import PhotoCapture, { type CapturedPhotos } from '../../components/camera/PhotoCapture';
import CtaButton from '../../components/common/CtaButton';
import Header from '../../components/common/Header';
import { COLORS } from '../../constants/colors';
import { useClothingItems } from '../../state/clothingStore';
import { useRentalState } from '../../state/rentalStore';
import { formatFullDateTime } from '../../utils/formatDate';
import { completeTradePhotos, nextPhotoCheckpoint, photoRecordKey, saveTradePhotoDraft, useTradePhotos } from '../../state/tradePhotoStore';

const CHECKPOINT_COPY = {
  handoff: { title: '전달 직전 상태 사진', guide: '옷을 건네기 직전 상태를\n앞면부터 찍어주세요', done: '이제 옷을 빌려받는 사람에게 전달하면\n거래가 다음 단계로 진행돼요.' },
  receipt: { title: '받은 직후 사진', guide: '받은 옷 상태를\n앞면부터 찍어주세요', done: '옷을 예쁘게 입고 약속된 반납일에\n돌려주시면 돼요.' },
  return: { title: '반납 전 사진', guide: '세탁한 옷 상태를\n앞면부터 찍어주세요', done: '세탁 후 옷 상태 사진을 올려주시면\n반납 절차가 진행돼요.' },
} as const;
const OWNER_WASHES_RETURN = { title: '반납 전 사진', guide: '돌려줄 옷 상태를\n앞면부터 찍어주세요', done: '옷을 돌려주면 등록자가 확인하고\n거래를 완료해요.' };

export default function TradePhotoScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'TradePhoto'>) {
  const { currentUserId, rentals } = useRentalState();
  const records = useTradePhotos();
  const clothes = useClothingItems();
  const rental = rentals.find(r => r.id === route.params.rentalId);
  // 완료하면 거래 단계가 바뀌므로, 나가는 동안 다른 제목·안내가 보이지 않게 진입 시점 값으로 고정합니다.
  const [checkpoint] = useState(() => rental ? nextPhotoCheckpoint(rental, currentUserId) : null);
  const [captured, setCaptured] = useState<CapturedPhotos | null>(null);
  const finished = useRef(false);

  if (!rental || !checkpoint) return <SafeAreaView style={{ flex: 1 }}><Header type="back" title="거래 사진" onPressLeft={() => navigation.goBack()} /><Text>촬영 가능한 거래가 아니에요.</Text></SafeAreaView>;

  const ownerWashes = clothes.find(c => c.id === rental.clothId)?.laundryIncluded;
  const copy = checkpoint === 'return' && ownerWashes ? OWNER_WASHES_RETURN : CHECKPOINT_COPY[checkpoint];

  const finish = (photos: CapturedPhotos) => {
    if (finished.current) return;
    try {
      completeTradePhotos(rental.id, checkpoint, photos);
      finished.current = true;
      navigation.goBack();
    } catch (error) {
      Alert.alert('거래 사진', error instanceof Error ? error.message : '다시 시도해주세요.');
    }
  };

  if (captured) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={styles.body}>
          <View style={styles.iconCircle}>
            <Image source={require('../../../assets/icons/check.png')} style={styles.icon} resizeMode="contain" />
          </View>
          <Text style={styles.title}>촬영을 완료했어요</Text>
          <Text style={styles.description}>{copy.done}</Text>
        </View>
        <View style={styles.bottomCta}>
          <CtaButton title="다음" onPress={() => finish(captured)} />
        </View>
      </SafeAreaView>
    );
  }

  return <PhotoCapture title={copy.title} guide={copy.guide} guideCaption={`촬영 시각: ${formatFullDateTime(new Date())}`} showStep={false}
    initialPhotos={records[photoRecordKey(rental.id, checkpoint)]?.photos}
    onClose={() => navigation.goBack()}
    onPhotosChange={photos => {
      try { saveTradePhotoDraft(rental.id, checkpoint, photos); }
      catch (error) { Alert.alert('사진 저장', error instanceof Error ? error.message : '다시 시도해주세요.'); }
    }}
    onNext={setCaptured} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  iconCircle: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: COLORS.primaryLight,
  },

  icon: {
    width: 32,
    height: 32,
    tintColor: COLORS.primary,
  },

  title: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    lineHeight: 29,
    color: COLORS.text,
    includeFontPadding: false,
  },

  description: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20.3,
    textAlign: 'center',
    color: COLORS.textSub,
    includeFontPadding: false,
  },

  bottomCta: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
