import { useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import PhotoCapture from '../../components/camera/PhotoCapture';
import { hasRequiredPhotos, PHOTO_PARTS } from '../../components/camera/photoPolicy';
import TextInputField from '../../components/common/TextInputField';
import AreaInputField from '../../components/common/AreaInputField';
import ChipButton from '../../components/common/ChipButton';
import ChipActiveButton from '../../components/common/ChipActiveButton';
import CtaButton from '../../components/common/CtaButton';
import CtaDisabledButton from '../../components/common/CtaDisabledButton';
import RadioInputField from '../../components/common/RadioInputField';
import ToggleInputField from '../../components/common/ToggleInputField';
import ColorChipGroup from '../../components/clothing/ColorChipGroup';
import SizeDiagram from '../../components/clothing/SizeDiagram';
import RegionSheet from '../../components/bottomsheet/RegionSheet';
import BottomSheet from '../../components/bottomsheet/BottomSheet';
import DateRangeCalendar from '../../components/common/DateRangeCalendar';
import { COLORS } from '../../constants/colors';
import { CATEGORIES, SIZES } from '../../constants/clothing';
import { createRegistrationDraft, draftFromCloth, fillScenario, MEASUREMENT_LABELS, registrationErrors, buildRegisteredCloth } from '../../utils/registration';
import type { RegistrationDraft } from '../../types/registration';
import { saveClothing, updateClothing, useClothingItems } from '../../state/clothingStore';
import { findDemoUser, getRentalState, useRentalState } from '../../state/rentalStore';
import { hasActiveTrade } from '../../utils/myClothes';
import { formatDate } from '../../utils/formatDate';

// 백엔드 없이 임시저장·재진입을 시연합니다. 앱 재시작 시 초기화됩니다.
const savedDrafts = new Map<string, RegistrationDraft>();
type Props = NativeStackScreenProps<RootStackParamList,'ClothRegister'>;
function Section({label,children}: {label:string;children:React.ReactNode}) {
  return <View style={styles.section}><Text style={styles.label}>{label}</Text>{children}</View>;
}
function Note({children}: {children:string}) {
  return <View style={styles.note}><Image source={require('../../../assets/icons/info.png')} style={styles.info} /><Text style={styles.noteText}>{children}</Text></View>;
}
function SelectRow({label,value,onPress}: {label:string;value:string;onPress:()=>void}) {
  return <Section label={label}><Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.select}><Text style={styles.selectText}>{value}</Text><Image source={require('../../../assets/icons/chevron-right.png')} style={styles.icon} /></Pressable></Section>;
}
export default function ClothRegisterScreen({navigation,route}: Props) {
  const { currentUserId, rentals } = useRentalState();
  const clothes = useClothingItems();
  const editingId = route.params?.clothId;
  const original = clothes.find(c => c.id === editingId && c.ownerId === currentUserId && !c.deleted);
  const draftOwnerId = useRef(currentUserId).current;
  const draftKey = `${draftOwnerId}:${editingId ?? 'new'}`;
  const initialDraft = () => savedDrafts.get(draftKey) ?? (original ? draftFromCloth(original) : createRegistrationDraft());
  const [draft,setDraft] = useState<RegistrationDraft>(initialDraft);
  const [phase,setPhase] = useState<'camera'|'form'>(() => editingId || hasRequiredPhotos(initialDraft().photos) ? 'form' : 'camera');
  const [regionOpen,setRegionOpen] = useState(false);
  const [calendarOpen,setCalendarOpen] = useState(false);
  const [start,setStart] = useState<Date|null>(null);
  const [end,setEnd] = useState<Date|null>(null);
  const submitting = useRef(false);
  const update = <K extends keyof RegistrationDraft>(key:K,value:RegistrationDraft[K]) => setDraft(current => ({...current,[key]:value}));
  const close = () => Alert.alert('등록을 나갈까요?', '작성 중인 내용을 임시저장할 수 있어요.', [
    {text:'계속 작성',style:'cancel'},
    {text:'저장하지 않고 나가기',style:'destructive',onPress:()=>{savedDrafts.delete(draftKey);navigation.goBack();}},
    {text:'임시저장 후 나가기',onPress:()=>{savedDrafts.set(draftKey,draft);navigation.goBack();}},
  ]);
  const openCalendar = () => {setStart(draft.unavailable ? new Date(draft.unavailable.start) : null);setEnd(draft.unavailable ? new Date(draft.unavailable.end) : null);setCalendarOpen(true);};
  const errors = registrationErrors(draft);
  const submit = () => {
    if (submitting.current) return;
    if (errors.length) {Alert.alert('등록 정보 확인',errors[0]);return;}
    submitting.current = true;
    try {
      if (getRentalState().currentUserId !== draftOwnerId) throw new Error('계정이 변경됐어요. 다시 등록해주세요.');
      const owner = findDemoUser(draftOwnerId);
      if (!owner) throw new Error('등록자 정보를 확인해주세요.');
      const built = buildRegisteredCloth(draft, owner);
      if (editingId) {
        if (!original) throw new Error('수정할 옷을 찾을 수 없어요.');
        const item = { ...original, ...built, detail: { ...original.detail, ...built.detail!, postedLabel: original.detail?.postedLabel } };
        // 색상·사이즈를 바꾼 경우 예전 표시 문자열을 남기지 않습니다.
        if (original.size !== item.size) item.sizeLabel = undefined;
        if (original.colors.join() !== item.colors.join()) item.colorLabel = undefined;
        updateClothing(item, draftOwnerId);
        savedDrafts.delete(draftKey);
        navigation.replace('ClothDetail',{clothId:item.id});
      } else {
        saveClothing(built);
        savedDrafts.delete(draftKey);
        navigation.replace('ClothRegisterComplete',{clothId:built.id});
      }
    } catch (error) {submitting.current=false;Alert.alert('등록 정보 확인',error instanceof Error ? error.message : '입력 내용을 확인해주세요.');}
  };
  if (editingId && (!original || hasActiveTrade(rentals, editingId))) return <SafeAreaView style={styles.container}><Text style={styles.label}>진행 중인 거래가 있거나 수정할 수 없는 옷이에요.</Text><CtaButton title="돌아가기" onPress={() => navigation.goBack()} /></SafeAreaView>;
  if (phase === 'camera') return <PhotoCapture initialPhotos={draft.photos} onPhotosChange={photos=>update('photos',photos)} onClose={()=>hasRequiredPhotos(draft.photos) ? setPhase('form') : close()} onNext={photos=>{update('photos',photos);setPhase('form');}} />;
  return <SafeAreaView style={styles.container} edges={['top','bottom']}>
    <StatusBar style="dark" />
    <View style={styles.header}>
      <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="등록 닫기" hitSlop={10}><Image source={require('../../../assets/icons/x.png')} style={styles.icon} /></Pressable>
      <Text style={styles.heading}>{editingId ? '옷 수정' : '옷 올리기'}</Text>
      <Pressable onPress={()=>{savedDrafts.set(draftKey,draft);Alert.alert('임시저장','앱을 종료하기 전까지 작성한 내용을 보관해요.');}} accessibilityRole="button"><Text style={styles.muted}>임시저장</Text></Pressable>
    </View>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
          <Pressable onPress={()=>setPhase('camera')} accessibilityRole="button" accessibilityLabel="촬영한 사진 수정" style={styles.photoButton}><Image source={require('../../../assets/icons/camera.png')} style={styles.icon} /><Text style={styles.small}>{Object.keys(draft.photos).length}/4</Text></Pressable>
          {PHOTO_PARTS.map(part=>draft.photos[part] ? <Pressable key={part} onPress={()=>setPhase('camera')} accessibilityRole="button" accessibilityLabel={`${part} 사진 확인`}><Image source={{uri:draft.photos[part]}} style={styles.thumbnail} /><Text style={styles.small}>{part}</Text></Pressable> : null)}
        </ScrollView>
        {__DEV__ && <Pressable accessibilityRole="button" onPress={()=>{setDraft(fillScenario(draft));Alert.alert('시연 정보 입력','라벤더 원피스 시나리오를 입력 예시로 불러왔어요. 실측과 택배비는 프론트 시연용 예시입니다. 등록하면 기존 데이터와 별개의 새 옷으로 추가됩니다.');}}><Text style={styles.link}>시나리오 정보로 채우기</Text></Pressable>}
        <TextInputField label="제목 *" placeholder="예) 트위드 싱글 재킷 (2~30자)" value={draft.title} onChangeText={value=>update('title',value.slice(0,30))} />
        <Section label="카테고리 *"><View style={styles.chips}>{CATEGORIES.map(category=>category===draft.category ? <ChipActiveButton key={category} title={category} onPress={()=>{}} /> : <ChipButton key={category} title={category} onPress={()=>setDraft(current=>({...current,category,size:category==='잡화'?'FREE':current.size,measurements:{}}))} />)}</View></Section>
        {draft.category !== '잡화' && <Section label="표기 사이즈 *"><View style={styles.chips}>{SIZES.map(size=>size===draft.size ? <ChipActiveButton key={size} title={size} onPress={()=>{}} /> : <ChipButton key={size} title={size} onPress={()=>update('size',size)} />)}</View></Section>}
        <Section label="컬러 *  (최대 2개 선택할 수 있어요)"><ColorChipGroup selected={draft.colors} onChange={colors=>{if(colors.length<=2) update('colors',colors);else Alert.alert('컬러 선택','컬러는 최대 2개까지 선택할 수 있어요.');}} /></Section>
        {draft.category && draft.category !== '잡화' && <Section label="실측 사이즈 (cm)">
          <SizeDiagram category={draft.category} measurements={Object.fromEntries(Object.entries(draft.measurements).map(([key,value]) => [key,Number(value)]))} />
          <View style={styles.measurements}>{MEASUREMENT_LABELS[draft.category].map(label=><View key={label} style={styles.measurement}><TextInputField label={`${label}${label==='총장'?' *':''}`} keyboardType="decimal-pad" placeholder="0" value={draft.measurements[label] ?? ''} onChangeText={value=>update('measurements',{...draft.measurements,[label]:value})} /></View>)}</View>
          <Note>그림처럼 옷을 평평하게 놓고 재주세요. 필수가 아닌 항목은 비워둬도 돼요</Note>
        </Section>}
        <Section label="하자 여부 *"><View style={styles.chips}><RadioInputField label="없음" selected={draft.hasDefect===false} onPress={()=>update('hasDefect',false)} /><RadioInputField label="있음" selected={draft.hasDefect===true} onPress={()=>update('hasDefect',true)} /></View>
          {draft.hasDefect && <View style={styles.defect}>
            <Pressable onPress={()=>setPhase('camera')} accessibilityRole="button" accessibilityLabel="디테일 하자 사진 촬영" style={styles.photoButton}>{draft.photos.디테일 ? <Image source={{uri:draft.photos.디테일}} style={styles.thumbnail} /> : <Image source={require('../../../assets/icons/camera.png')} style={styles.icon} />}</Pressable>
            <AreaInputField label="하자 설명 *" placeholder="하자의 위치와 상태를 알려주세요" value={draft.defectDescription} onChangeText={value=>update('defectDescription',value)} maxLength={500} />
          </View>}
        </Section>
        <AreaInputField label="설명 [선택]" placeholder="옷의 소재, 착용감, 보관 상태 등을 알려주세요" value={draft.description} onChangeText={value=>update('description',value)} maxLength={2000} />
        <SelectRow label="거래 가능 지역 *" value={draft.region ? `${draft.region.sido} ${draft.region.district}` : '시/구를 선택해주세요'} onPress={()=>setRegionOpen(true)} />
        <Section label="대여 불가능 기간 *">
          <View style={styles.chips}><RadioInputField label="없음" selected={draft.unavailableConfirmed && !draft.unavailable} onPress={()=>setDraft(current=>({...current,unavailable:null,unavailableConfirmed:true}))} /><RadioInputField label="기간 선택" selected={!!draft.unavailable} onPress={openCalendar} /></View>
          {draft.unavailable && <Pressable onPress={openCalendar} style={styles.select} accessibilityRole="button"><Text style={styles.selectText}>{formatDate(new Date(draft.unavailable.start))} ~ {formatDate(new Date(draft.unavailable.end))}</Text><Image source={require('../../../assets/icons/calendar.png')} style={styles.icon} /></Pressable>}
          <Note>직접 입어야 하거나 세탁·보관 등 대여할 수 없는 날짜를 미리 설정해 주세요.</Note>
        </Section>
        <TextInputField label="대여료 (한 벌 1회) *" placeholder="₩ 대여료" keyboardType="number-pad" value={draft.price} onChangeText={value=>update('price',value)} />
        <View style={styles.toggleRow}><View><Text style={styles.label}>택배 거래 허용</Text><Text style={styles.small}>직거래는 기본으로 가능해요</Text></View><ToggleInputField value={draft.shippingAvailable} onValueChange={value=>update('shippingAvailable',value)} accessibilityLabel="택배 거래 허용" /></View>
        {draft.shippingAvailable && <Section label="택배비 [택배 가능일 때 필수]"><TextInputField label="보내는 택배비" placeholder="₩ 택배비" keyboardType="number-pad" value={draft.shippingFee} onChangeText={value=>update('shippingFee',value)} /><Text style={styles.small}>보내는 택배비만 적어주세요. 반납 택배비는 빌린 사람이 내요</Text></Section>}
        <Section label="세탁은 누가 하나요? *">
          <RadioInputField label="빌린 사람이 세탁해서 돌려줘요 (기본)" selected={draft.laundryBy==='borrower'} onPress={()=>update('laundryBy','borrower')} />
          <RadioInputField label="제가 직접 세탁할게요" selected={draft.laundryBy==='owner'} onPress={()=>update('laundryBy','owner')} />
          <Note>빌린 사람이 세탁하면 세탁 과정에서 옷이 변형될 수 있어요. 드라이클리닝이 필요한 옷은 직접 세탁을 추천해요</Note>
        </Section>
        {errors.length>0 && <Text style={styles.error}>{errors[0]}</Text>}
      </ScrollView>
      <View style={styles.footer}>{errors.length ? <CtaDisabledButton title={editingId ? '수정 완료' : '등록하기'} /> : <CtaButton title={editingId ? '수정 완료' : '등록하기'} onPress={submit} />}</View>
    </KeyboardAvoidingView>
    <RegionSheet visible={regionOpen} value={draft.region} onSelect={region=>{update('region',region);setRegionOpen(false);}} onClose={()=>setRegionOpen(false)} />
    <BottomSheet visible={calendarOpen} title="대여 불가능 기간을 정해주세요" onClose={()=>setCalendarOpen(false)} footer={start&&end ? <CtaButton title="이 날짜로 보기" onPress={()=>{setDraft(current=>({...current,unavailable:{start:start.getTime(),end:end.getTime()},unavailableConfirmed:true}));setCalendarOpen(false);}} /> : <CtaDisabledButton title="이 날짜로 보기" />}>
      {calendarOpen && <DateRangeCalendar start={start} end={end} onChange={(s,e)=>{setStart(s);setEnd(e);}} />}
      <Text style={styles.label}>대여 불가능 기간  {start ? `${formatDate(start)} ~ ${end?formatDate(end):'종료일 선택'}` : '-'}</Text>
    </BottomSheet>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.white},flex:{flex:1},header:{height:56,paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},heading:{fontFamily:'Pretendard-SemiBold',fontSize:16,color:COLORS.text},icon:{width:24,height:24,tintColor:COLORS.text},muted:{fontFamily:'Pretendard-Medium',fontSize:14,color:COLORS.textSub},
  body:{padding:20,gap:24,paddingBottom:32},section:{gap:12},label:{fontFamily:'Pretendard-Medium',fontSize:14,lineHeight:20.3,color:COLORS.text},chips:{flexDirection:'row',flexWrap:'wrap',gap:6,rowGap:10},photoRow:{gap:8},photoButton:{width:72,height:72,borderRadius:12,borderWidth:1,borderColor:COLORS.border,alignItems:'center',justifyContent:'center',overflow:'hidden',gap:2},thumbnail:{width:72,height:72,borderRadius:12},small:{fontFamily:'Pretendard-Regular',fontSize:12,lineHeight:17.4,color:COLORS.textSub},link:{fontFamily:'Pretendard-Medium',fontSize:13,color:COLORS.primary},
  measurements:{flexDirection:'row',flexWrap:'wrap',gap:8},measurement:{width:'31%'},note:{flexDirection:'row',gap:6,padding:12,borderRadius:12,backgroundColor:COLORS.bgGray},info:{width:16,height:16,tintColor:COLORS.textSub},noteText:{flex:1,fontFamily:'Pretendard-Regular',fontSize:13,lineHeight:18.85,color:COLORS.textSub},defect:{backgroundColor:COLORS.bgLight,borderRadius:12,padding:12,gap:8},select:{minHeight:46,borderWidth:1,borderColor:COLORS.border,borderRadius:12,paddingVertical:12,paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:8},selectText:{flex:1,fontFamily:'Pretendard-Regular',fontSize:14,color:COLORS.text},toggleRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12},footer:{paddingHorizontal:20,paddingTop:12,paddingBottom:12,borderTopWidth:1,borderTopColor:COLORS.line},error:{fontFamily:'Pretendard-Regular',fontSize:13,lineHeight:19,color:COLORS.alert},
});
