import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import CtaButton from '../../components/common/CtaButton';
import { COLORS } from '../../constants/colors';

export default function ClothRegisterCompleteScreen({navigation}:NativeStackScreenProps<RootStackParamList,'ClothRegisterComplete'>) {
 return <SafeAreaView style={styles.container}><StatusBar style="dark" /><View style={styles.body}>
  <View style={styles.circle}><Image source={require('../../../assets/icons/check.png')} style={styles.check} resizeMode="contain" /></View>
  <Text style={styles.title}>옷을 등록했어요!</Text><Text style={styles.description}>대여 신청이 오면 알림으로 알려드릴게요.</Text>
 </View><View style={styles.footer}><CtaButton title="홈으로" onPress={()=>navigation.reset({index:0,routes:[{name:'Main'}]})} /></View></SafeAreaView>;
}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:COLORS.white},body:{flex:1,justifyContent:'center',alignItems:'center',gap:12,paddingHorizontal:16},circle:{width:72,height:72,borderRadius:36,backgroundColor:COLORS.primaryLight,alignItems:'center',justifyContent:'center'},check:{width:48,height:48,tintColor:COLORS.primary},title:{fontFamily:'Pretendard-SemiBold',fontSize:20,lineHeight:29,color:COLORS.text},description:{fontFamily:'Pretendard-Medium',fontSize:14,lineHeight:20.3,color:COLORS.textSub,textAlign:'center'},footer:{paddingHorizontal:20,paddingTop:12,paddingBottom:12}});
