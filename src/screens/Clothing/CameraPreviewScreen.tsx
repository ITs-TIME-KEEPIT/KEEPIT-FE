import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import PhotoCapture from '../../components/camera/PhotoCapture';

// Figma E. 거래 진행 → 체크포인트 촬영-전달 직전의 공통 UI 수동 점검용.
// DEMO_START_SCREEN='camera'일 때만 Expo에서 진입. 제품 화면 진입점은 아님.
export default function CameraPreviewScreen({navigation}: NativeStackScreenProps<RootStackParamList,'CameraPreview'>) {
 return <PhotoCapture title="전달 직전 상태 사진" guide={'옷을 건네기 직전 상태를\n앞면부터 찍어주세요'} onClose={() => navigation.reset({index:0,routes:[{name:'Main'}]})} />;
}
