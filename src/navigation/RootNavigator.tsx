
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import ProfileSetupScreen from '../screens/Auth/ProfileSetupScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import RentalRequestScreen from '../screens/Rental/RentalRequestScreen';
import RentalConfirmScreen from '../screens/Rental/RentalConfirmScreen';
import RentalCompleteScreen from '../screens/Rental/RentalCompleteScreen';

import type { TradeMethod } from '../types/rental';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ProfileSetup: undefined;
  Home: undefined;
  RentalRequest: { clothId: string };
  // 날짜는 직렬화 가능한 timestamp(ms)로 전달
  RentalConfirm: { clothId: string; start: number; end: number; method: TradeMethod };
  RentalComplete: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="RentalRequest"
        component={RentalRequestScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="RentalConfirm"
        component={RentalConfirmScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="RentalComplete"
        component={RentalCompleteScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
