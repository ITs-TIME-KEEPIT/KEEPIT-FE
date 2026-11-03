import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';

export const PHOTO_PARTS = ['전면', '후면', '라벨', '디테일'] as const;
export type PhotoPart = typeof PHOTO_PARTS[number];
export type CapturedPhotos = Partial<Record<PhotoPart, string>>;
type Props = {
  title: string;
  guide: string;
  onClose: () => void;
  onPhotosChange?: (photos: CapturedPhotos) => void;
  // 필수 부위/장수 정책은 호출 화면에서 확정해서 전달합니다.
  // 디자이너 확인 전에는 다음 버튼을 활성화하지 않습니다.
  canProceed?: boolean;
  onNext?: (photos: CapturedPhotos) => void;
};

/** 등록·전달·수령·반납 화면에서 재사용하는 앱 내 촬영 UI.
 * 사진 URI는 세션 임시 값입니다. 서버 업로드/서버 촬영 시각은 후속 연동합니다.
 */
export default function PhotoCapture({title, guide, onClose, onPhotosChange, canProceed = false, onNext}: Props) {
  const camera = useRef<CameraView>(null);
  const busy = useRef(false);
  const alive = useRef(true);
  const focused = useIsFocused();
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [part, setPart] = useState<PhotoPart>('전면');
  const [photos, setPhotos] = useState<CapturedPhotos>({});
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const preview = photos[part];
  useEffect(() => {
    alive.current = true;
    const subscription = AppState.addEventListener('change', state => {
      setActive(state === 'active');
      if (state === 'active') void getPermission();
    });
    return () => { alive.current = false; subscription.remove(); };
  }, [getPermission]);
  useEffect(() => { setReady(false); }, [focused, active, preview, permission?.granted]);

  const capture = async () => {
    if (busy.current) return;
    if (!permission?.granted) {
      if (permission && !permission.canAskAgain) {
        Alert.alert('카메라 권한', '설정에서 카메라 접근을 허용해주세요.', [{text:'취소',style:'cancel'},{text:'설정 열기',onPress:() => {void Linking.openSettings();}}]);
      } else {
        await requestPermission();
      }
      return;
    }
    if (!ready || !camera.current || preview || !focused || !active) return;
    busy.current = true;
    setCapturing(true);
    try {
      const photo = await camera.current.takePictureAsync({quality:0.85});
      if (!photo?.uri || !alive.current) return;
      const next = {...photos, [part]:photo.uri};
      setPhotos(next);
      onPhotosChange?.(next);
    } catch {
      if (alive.current) Alert.alert('촬영 실패', '카메라를 확인한 뒤 다시 촬영해주세요.');
    } finally {
      busy.current = false;
      if (alive.current) setCapturing(false);
    }
  };
  const retake = () => {
    if (busy.current || !preview) return;
    const next = {...photos};
    delete next[part];
    setReady(false);
    setPhotos(next);
    onPhotosChange?.(next);
  };
  const nextEnabled = canProceed && !!onNext && !capturing;
  return <SafeAreaView style={styles.container} edges={['top','bottom']}>
    <StatusBar style="light" />
    <View style={styles.header}>
      <Pressable onPress={onClose} disabled={capturing} accessibilityRole="button" accessibilityLabel="촬영 닫기" hitSlop={10}><Image source={require('../../../assets/icons/x.png')} style={styles.closeIcon} /></Pressable>
      <Text style={styles.title}>{title}</Text><View style={styles.closeIcon} />
    </View>
    <View style={styles.previewArea}>
      {preview ? <Image source={{uri:preview}} style={StyleSheet.absoluteFill} resizeMode="cover" /> : permission?.granted && focused && active ? <CameraView ref={camera} facing="back" mode="picture" style={StyleSheet.absoluteFill} onCameraReady={() => setReady(true)} onMountError={() => {setReady(false); Alert.alert('카메라 오류','카메라를 사용할 수 없어요. 실제 기기의 권한과 카메라 상태를 확인해주세요.');}} /> : null}
      <View pointerEvents="none" style={styles.guideBorder}><Text style={styles.guide}>{guide}</Text></View>
    </View>
    <View style={styles.parts}>
      {PHOTO_PARTS.map(value => <Pressable key={value} disabled={capturing} onPress={() => setPart(value)} accessibilityRole="button" accessibilityLabel={`${value}${photos[value] ? ', 촬영 완료' : ''}`} accessibilityState={{selected:part === value,disabled:capturing}} style={[styles.chip, part === value && styles.selectedChip]}><Text style={styles.chipText}>{photos[value] ? '✓ ' : ''}{value}</Text></Pressable>)}
    </View>
    <Text style={styles.notice}>대충 찍으면 분쟁이 생겼을 때 불리할 수 있어요</Text>
    <View style={styles.controls}>
      <Pressable onPress={retake} disabled={!preview || capturing} accessibilityRole="button" accessibilityState={{disabled:!preview || capturing}} style={styles.slot}><Text style={styles.action}>재촬영</Text></Pressable>
      <Pressable onPress={() => {void capture();}} disabled={capturing || !!preview} accessibilityRole="button" accessibilityLabel={`${part} 사진 촬영`} accessibilityState={{disabled:capturing || !!preview,busy:capturing}} style={[styles.shutter,capturing && {opacity:0.5}]} />
      <Pressable onPress={() => {if(nextEnabled) onNext?.(photos);}} disabled={!nextEnabled} accessibilityRole="button" accessibilityState={{disabled:!nextEnabled}} style={styles.slot}><Text style={[styles.action,!nextEnabled && styles.disabled]}>다음</Text></Pressable>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.black},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingTop:16,paddingBottom:12},closeIcon:{width:24,height:24,tintColor:COLORS.white},title:{fontFamily:'Pretendard-SemiBold',fontSize:16,lineHeight:23.2,color:COLORS.white},
  previewArea:{flex:1,marginHorizontal:40,marginTop:20,marginBottom:26,overflow:'hidden',borderRadius:20},guideBorder:{position:'absolute',top:0,right:0,bottom:0,left:0,borderWidth:2,borderStyle:'dashed',borderColor:COLORS.line,borderRadius:20,justifyContent:'center',alignItems:'center',paddingHorizontal:24},guide:{fontFamily:'Pretendard-Medium',fontSize:14,lineHeight:20.3,color:COLORS.white,textAlign:'center',textShadowColor:COLORS.black,textShadowRadius:3},
  parts:{flexDirection:'row',justifyContent:'center',gap:6,paddingHorizontal:16},chip:{backgroundColor:COLORS.glassWhite,borderRadius:999,paddingHorizontal:12,paddingVertical:6},selectedChip:{backgroundColor:COLORS.primary},chipText:{fontFamily:'Pretendard-Medium',fontSize:13,lineHeight:18.85,color:COLORS.white},notice:{fontFamily:'Pretendard-Regular',fontSize:12,lineHeight:17.4,color:COLORS.white,opacity:0.7,textAlign:'center',paddingTop:10,paddingBottom:4},
  controls:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:24,paddingTop:16,paddingBottom:16},slot:{width:80,height:44,justifyContent:'center',alignItems:'center'},action:{fontFamily:'Pretendard-Bold',fontSize:15,lineHeight:21.75,color:COLORS.primary},disabled:{color:COLORS.textSub},shutter:{width:72,height:72,borderRadius:999,borderWidth:4,borderColor:COLORS.primary,backgroundColor:COLORS.white},
});
