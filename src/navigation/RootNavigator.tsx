
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import ProfileSetupScreen from '../screens/Auth/ProfileSetupScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ClothDetailScreen from '../screens/Clothing/ClothDetailScreen';
import CameraPreviewScreen from '../screens/Clothing/CameraPreviewScreen';
import { DEMO_START_SCREEN } from '../mocks/demoScenario';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ProfileSetup: undefined;
  Home: undefined;
  ClothDetail: { clothId: string };
  CameraPreview: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName={__DEV__ && DEMO_START_SCREEN === 'camera' ? 'CameraPreview' : 'Login'}>
      {__DEV__ && <Stack.Screen name="CameraPreview" component={CameraPreviewScreen} options={{headerShown:false}} />}
      <Stack.Screen name="ClothDetail" component={ClothDetailScreen} options={{ headerShown: false }} />
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
    </Stack.Navigator>
  );
}
