import { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet, useWindowDimensions, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { MOCK_CLOTH_ITEMS } from '../../mocks/clothItems';
import { COLORS } from '../../constants/colors';
import Badge from '../../components/common/Badge';
import CtaButton from '../../components/common/CtaButton';
import SquareImage from '../../components/common/SquareImage';
import SizeDiagram from '../../components/clothing/SizeDiagram';

type Props = NativeStackScreenProps<RootStackParamList, 'ClothDetail'>;
const measurementLabels = {
  원피스: ['총장', '어깨너비', '가슴단면', '허리단면'],
  상의: ['총장', '어깨너비', '가슴단면', '소매길이'],
  아우터: ['총장', '어깨너비', '가슴단면', '소매길이'],
  하의: ['총장', '허리단면', '엉덩이단면', '허벅지단면', '밑단단면'],
  잡화: [],
};

function Row({ label, value, primary = false }: {label: string; value: string; primary?: boolean}) {
 return <View style={styles.row}><Text style={[styles.label, primary && styles.primary]}>{label}</Text><Text style={[styles.value, primary && styles.primary]}>{value}</Text></View>;
}

export default function ClothDetailScreen({ navigation, route }: Props) {
 const item = MOCK_CLOTH_ITEMS.find(cloth => cloth.id === route.params.clothId);
 const {width} = useWindowDimensions();
 const {bottom} = useSafeAreaInsets();
 const [page, setPage] = useState(0);
 if (!item) return <SafeAreaView style={styles.container}><CtaButton title="홈으로 돌아가기" onPress={() => navigation.goBack()} /></SafeAreaView>;
 const detail = item.detail;
 const photos = detail?.photos?.length ? detail.photos.map(photo => photo.uri) : detail?.photoUris?.length ? detail.photoUris : item.imageUrl ? [item.imageUrl] : [undefined];
 return <SafeAreaView style={styles.container} edges={['top']}>
  <ScrollView contentContainerStyle={{paddingBottom: 20}}>
   <View style={{height: width}}>
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={event => setPage(Math.round(event.nativeEvent.contentOffset.x / width))}>
     {photos.map((uri,index) => <View key={index} style={[styles.photo,{width,height:width}]}>{uri ? <Image source={{uri}} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <Text style={styles.caption}>옷 사진 (체크포인트 1단계, 앱 내 촬영)</Text>}</View>)}
    </ScrollView>
    <Pressable style={styles.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="뒤로 가기"><Image source={require('../../../assets/icons/chevron-left.png')} style={styles.icon} /></Pressable>
    <View style={styles.pagination}><Text style={styles.paginationText}>{page + 1} / {photos.length}</Text></View>
   </View>
   <Pressable style={styles.profile} accessibilityRole="button" accessibilityLabel="등록자 프로필" onPress={() => Alert.alert('준비 중', '등록자 프로필은 이번 작업 범위 이후 연결할 예정이에요.')}>
    <View style={styles.avatar}><Text style={styles.avatarText}>Aa</Text></View>
    <View style={{flex:1}}><Text style={styles.profileName}>{detail?.ownerName ?? '등록자'}</Text><Text style={styles.label}>{item.region}</Text></View>
    <Image source={require('../../../assets/icons/chevron-right.png')} style={styles.smallIcon} />
   </Pressable>
   <View style={styles.body}>
    <View style={styles.heading}><Text style={styles.title}>{item.title}</Text><View style={styles.badges}>{item.laundryIncluded && <Badge label="세탁 포함" />}{item.shippingAvailable && <Badge label="택배 가능" tone="gray" />}</View></View>
    <Text style={styles.label}>{item.category}{item.category !== '잡화' ? ` · ${item.sizeLabel ?? item.size}` : ''}{detail?.postedLabel ? ` · ${detail.postedLabel}` : ''}</Text>
    {detail?.description && <Text style={styles.description}>{detail.description}</Text>}
    <View style={styles.rental}>
     <Text style={styles.sectionTitle}>대여 정보</Text>
     <Row label="대여료" value={`${item.price.toLocaleString('ko-KR')}원`} primary />
     {item.shippingAvailable && <Row label="택배비" value={detail?.shippingFee !== undefined ? `${detail.shippingFee.toLocaleString('ko-KR')}원 (편도 · 택배 선택 시)` : '-'} />}
     <Row label="세탁" value={detail?.laundry ?? '-'} />
     <Row label="거래 방식" value={`직거래 (${item.region})${item.shippingAvailable ? ' · 택배 가능' : ''}`} />
     <Row label="대여 가능 기간" value={detail?.availablePeriod ?? '-'} />
    </View>
    {item.category !== '잡화' && <View style={styles.sizeCard}>
     <Text style={styles.sectionTitle}>사이즈</Text>
     <SizeDiagram category={item.category} />
     <Text style={styles.hint}>단면은 옷을 평평하게 놓고 잰 길이예요</Text>
     <Row label="표기 사이즈" value={item.sizeLabel ?? item.size} />
     {measurementLabels[item.category].map(label => <Row key={label} label={label} value="- cm" />)}
    </View>}
    <View style={styles.defect}>
     <View style={styles.row}><Text style={styles.label}>하자 고지</Text><Text style={[styles.value, detail?.defect ? styles.alert : undefined]}>{detail?.defect ? `있음 · ${detail.defect.count}곳` : detail ? '없음' : '-'}</Text></View>
     {detail?.defect && <><Text style={styles.defectText}>{detail.defect.description}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8}}>{(detail.defect.photoUris?.length ? detail.defect.photoUris : [undefined,undefined,undefined,undefined]).map((uri,index) => <SquareImage key={index} source={uri ? {uri} : undefined} />)}</ScrollView></>}
    </View>
    {detail?.views !== undefined && <Text style={styles.label}>조회 {detail.views}</Text>}
   </View>
  </ScrollView>
  <View style={[styles.footer,{paddingBottom:Math.max(bottom, 16)}]}><CtaButton title="대여 신청" onPress={() => Alert.alert('준비 중', '대여 신청 화면은 B 담당 작업과 연결할 예정이에요.')} /></View>
 </SafeAreaView>;
}

const styles = StyleSheet.create({
 container:{flex:1,backgroundColor:COLORS.white},
 photo:{alignItems:'center',justifyContent:'center',backgroundColor:COLORS.bgGray},
 caption:{fontFamily:'Pretendard-Regular',fontSize:13,lineHeight:18.85,color:COLORS.textSub},
 back:{position:'absolute',left:8,top:8,padding:8},icon:{width:24,height:24,tintColor:COLORS.text},smallIcon:{width:20,height:20,tintColor:COLORS.text},
 pagination:{position:'absolute',right:16,bottom:16,paddingHorizontal:10,paddingVertical:4,borderRadius:999,backgroundColor:'rgba(0,0,0,0.5)'},paginationText:{fontFamily:'Pretendard-Medium',fontSize:12,lineHeight:17.4,color:COLORS.white},
 profile:{flexDirection:'row',alignItems:'center',gap:10,padding:16,borderBottomWidth:1,borderBottomColor:COLORS.bgGray,minHeight:74},avatar:{width:44,height:44,borderRadius:999,backgroundColor:COLORS.border,alignItems:'center',justifyContent:'center'},avatarText:{fontFamily:'Pretendard-Regular',fontSize:13.2,color:COLORS.white},profileName:{fontFamily:'Pretendard-SemiBold',fontSize:16,lineHeight:23.2,color:COLORS.text},
 body:{paddingHorizontal:20,paddingVertical:18,gap:16},heading:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:12},title:{fontFamily:'Pretendard-SemiBold',fontSize:20,lineHeight:29,color:COLORS.text,flexShrink:1},badges:{flexDirection:'row',gap:4,flexWrap:'wrap'},
 description:{fontFamily:'Pretendard-Regular',fontSize:15,lineHeight:21.75,color:COLORS.text},rental:{paddingHorizontal:4,paddingVertical:16,gap:16},sectionTitle:{fontFamily:'Pretendard-SemiBold',fontSize:15,lineHeight:21.75,color:COLORS.text},
 row:{flexDirection:'row',justifyContent:'space-between',gap:16,alignItems:'flex-start'},label:{fontFamily:'Pretendard-Regular',fontSize:14,lineHeight:20.3,color:COLORS.textSub},value:{fontFamily:'Pretendard-Medium',fontSize:14,lineHeight:20.3,color:COLORS.text,textAlign:'right',flexShrink:1},primary:{color:COLORS.primary},
 sizeCard:{borderWidth:1,borderColor:COLORS.border,borderRadius:12,paddingHorizontal:12,paddingVertical:16,gap:10},hint:{fontFamily:'Pretendard-Regular',fontSize:13,lineHeight:18.85,color:COLORS.textPlaceholder},
 defect:{borderWidth:1,borderColor:COLORS.border,borderRadius:12,padding:16,gap:10},defectText:{fontFamily:'Pretendard-Regular',fontSize:14,lineHeight:20.3,color:COLORS.textPlaceholder},alert:{color:COLORS.alert},footer:{borderTopWidth:1,borderTopColor:COLORS.line,paddingHorizontal:20,paddingTop:12},
});
