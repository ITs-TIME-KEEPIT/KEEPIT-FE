import { View, Text, Button, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
export default function LoginScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text>KEEPIT · 로그인 UI 작업 예정</Text>
      <Button title="홈 미리보기" onPress={() => navigation.navigate('Home')} />
      <Button title="회원가입" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' } });
