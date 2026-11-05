import { Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import PhotoCapture from '../../components/camera/PhotoCapture';
import Header from '../../components/common/Header';
import { useRentalState } from '../../state/rentalStore';
import { completeTradePhotos, nextPhotoCheckpoint, photoRecordKey, saveTradePhotoDraft, useTradePhotos } from '../../state/tradePhotoStore';

export const CHECKPOINT_TITLES = { handoff: '전달 직전 상태 사진', receipt: '수령 시 상태 사진', return: '반납 전 상태 사진' } as const;

export default function TradePhotoScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'TradePhoto'>) {
  const { currentUserId, rentals } = useRentalState();
  const records = useTradePhotos();
  const rental = rentals.find(r => r.id === route.params.rentalId);
  const checkpoint = rental ? nextPhotoCheckpoint(rental, currentUserId) : null;
  if (!rental || !checkpoint) return <SafeAreaView style={{ flex: 1 }}><Header type="back" title="거래 사진" onPressLeft={() => navigation.goBack()} /><Text>촬영 가능한 거래가 아니에요.</Text></SafeAreaView>;
  return <PhotoCapture title={CHECKPOINT_TITLES[checkpoint]} showStep={false}
    initialPhotos={records[photoRecordKey(rental.id, checkpoint)]?.photos}
    onClose={() => navigation.goBack()}
    onPhotosChange={photos => {
      try { saveTradePhotoDraft(rental.id, checkpoint, photos); }
      catch (error) { Alert.alert('사진 저장', error instanceof Error ? error.message : '다시 시도해주세요.'); }
    }}
    onNext={photos => Alert.alert('사진 기록 완료', checkpoint === 'handoff' ? '옷을 전달했나요? 확인하면 수령 대기 단계로 넘어가요.' : checkpoint === 'receipt' ? '옷을 수령했나요? 확인하면 반납 대기 단계로 넘어가요.' : '세탁을 마치고 옷을 반납했나요? 확인하면 등록자 확인 단계로 넘어가요.', [
      { text: '계속 확인', style: 'cancel' },
      { text: '완료', onPress: () => {
        try { completeTradePhotos(rental.id, checkpoint, photos); navigation.goBack(); }
        catch (error) { Alert.alert('거래 사진', error instanceof Error ? error.message : '다시 시도해주세요.'); }
      } },
    ])} />;
}
