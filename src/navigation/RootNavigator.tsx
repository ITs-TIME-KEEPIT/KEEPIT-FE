import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import HomeScreen from '../screens/Home/HomeScreen';

export type RootStackParamList = { Login: undefined; Signup: undefined; Home: undefined };
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: '로그인' }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: '회원가입' }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'KEEPIT' }} />
    </Stack.Navigator>
  );
}
