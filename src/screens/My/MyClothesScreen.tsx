import { useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import SquareImage from '../../components/common/SquareImage';
import CtaButton from '../../components/common/CtaButton';
import BottomSheet from '../../components/bottomsheet/BottomSheet';
import { COLORS } from '../../constants/colors';
import { useClothingItems, setClothingHidden, deleteClothing } from '../../state/clothingStore';
import { useRentalState } from '../../state/rentalStore';
import { clothingStatus, hasActiveTrade } from '../../utils/myClothes';

export default function MyClothesScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'MyClothes'>) {
  const clothes = useClothingItems();
  const { currentUserId, rentals } = useRentalState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = clothes.find(c => c.id === selectedId && c.ownerId === currentUserId);
  const mine = clothes.filter(c => c.ownerId === currentUserId && !c.deleted);
  const run = (action: () => void) => {
    try { action(); setSelectedId(null); }
    catch (error) { Alert.alert('옷 관리', error instanceof Error ? error.message : '다시 시도해주세요.'); }
  };
  return <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
    <Header type="back" title="내 옷" onPressLeft={() => navigation.goBack()} />
    <FlatList data={mine} keyExtractor={c => c.id} contentContainerStyle={mine.length ? undefined : styles.emptyBody}
      ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>아직 등록된 옷이 없어요</Text><Text style={styles.meta}>첫 번째 옷을 등록하고 대여를 시작해 보세요.</Text><CtaButton title="옷 올리기" onPress={() => navigation.navigate('ClothRegister')} /></View>}
      renderItem={({ item }) => {
        const status = clothingStatus(item, rentals);
        return <View style={styles.card}>
          <Pressable style={styles.content} accessibilityRole="button" accessibilityLabel={`${item.title}, 받은 신청 ${status.count}건 보기`} onPress={() => navigation.navigate('ReceivedRequests', { clothId: item.id })}>
            <SquareImage size={80} source={item.imageUrl ? { uri: item.imageUrl } : undefined} />
            <View style={styles.texts}><Badge label={status.label} tone={status.tone} /><Text style={styles.title}>{item.title}</Text><Text style={styles.meta}>{item.hidden ? '목록에서 숨김 · ' : ''}받은 신청 {status.count}건</Text></View>
          </Pressable>
          <Pressable onPress={() => setSelectedId(item.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${item.title} 더보기`}><Image source={require('../../../assets/icons/more.png')} style={styles.icon} /></Pressable>
        </View>;
      }} />
    <BottomSheet visible={!!selected} title={selected?.title ?? ''} onClose={() => setSelectedId(null)}>
      {selected && <View>
        <Pressable style={styles.action} accessibilityRole="button" onPress={() => { setSelectedId(null); navigation.navigate('ClothDetail', { clothId: selected.id }); }}><Text style={styles.actionText}>옷 상세 보기</Text></Pressable>
        <Pressable style={styles.action} accessibilityRole="button" onPress={() => {
          if (hasActiveTrade(rentals, selected.id)) { Alert.alert('수정할 수 없어요', '진행 중인 거래를 먼저 완료해주세요.'); return; }
          setSelectedId(null); navigation.navigate('ClothRegister', { clothId: selected.id });
        }}><Text style={styles.actionText}>수정하기</Text></Pressable>
        <Pressable style={styles.action} accessibilityRole="button" onPress={() => run(() => setClothingHidden(selected.id, !selected.hidden, currentUserId))}><Text style={styles.actionText}>{selected.hidden ? '대여 재개 (목록에 표시하기)' : '대여 중지 (목록에서 숨기기)'}</Text></Pressable>
        <Pressable style={styles.action} accessibilityRole="button" onPress={() => {
          if (hasActiveTrade(rentals, selected.id)) { Alert.alert('삭제할 수 없어요', '진행 중인 거래를 먼저 완료해주세요.'); return; }
          Alert.alert('옷을 삭제할까요?', '삭제한 옷은 되돌릴 수 없어요.', [{ text: '취소', style: 'cancel' }, { text: '삭제', style: 'destructive', onPress: () => run(() => deleteClothing(selected.id, currentUserId)) }]);
        }}><Text style={[styles.actionText, styles.danger]}>삭제하기</Text></Pressable>
        <View style={styles.note}><Image source={require('../../../assets/icons/info.png')} style={styles.info} /><Text style={styles.noteText}>진행 중인 거래가 있으면 수정·삭제할 수 없어요. 대여 중지해도 이미 수락된 거래는 그대로 진행돼요.</Text></View>
      </View>}
    </BottomSheet>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  card: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.line, alignItems: 'flex-start' },
  content: { flex: 1, flexDirection: 'row', gap: 12 }, texts: { flex: 1, gap: 4 },
  title: { fontFamily: 'Pretendard-Medium', fontSize: 15, lineHeight: 21.75, color: COLORS.text },
  meta: { fontFamily: 'Pretendard-Regular', fontSize: 13, lineHeight: 18.85, color: COLORS.textSub },
  icon: { width: 24, height: 24, tintColor: COLORS.text },
  emptyBody: { flexGrow: 1, justifyContent: 'center', padding: 20 }, empty: { gap: 16, alignItems: 'center' },
  emptyTitle: { fontFamily: 'Pretendard-SemiBold', fontSize: 20, lineHeight: 29, color: COLORS.text },
  action: { minHeight: 51, paddingVertical: 14 }, actionText: { fontFamily: 'Pretendard-Medium', fontSize: 16, lineHeight: 23.2, color: COLORS.text },
  danger: { color: COLORS.alert }, note: { padding: 12, backgroundColor: COLORS.bgGray, borderRadius: 12, flexDirection: 'row', gap: 6 },
  info: { width: 16, height: 16, tintColor: COLORS.textSub }, noteText: { flex: 1, fontFamily: 'Pretendard-Regular', fontSize: 13, lineHeight: 18.85, color: COLORS.textSub },
});
