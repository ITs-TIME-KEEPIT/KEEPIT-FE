import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import ProfileSetupScreen from '../screens/Auth/ProfileSetupScreen';
import HomeScreen from '../screens/Home/HomeScreen';

import ClothDetailScreen from '../screens/Clothing/ClothDetailScreen';
import CameraPreviewScreen from '../screens/Clothing/CameraPreviewScreen';
import ClothRegisterScreen from '../screens/Clothing/ClothRegisterScreen';
import ClothRegisterCompleteScreen from '../screens/Clothing/ClothRegisterCompleteScreen';

import RentalRequestScreen from '../screens/Rental/RentalRequestScreen';
import RentalConfirmScreen from '../screens/Rental/RentalConfirmScreen';
import RentalCompleteScreen from '../screens/Rental/RentalCompleteScreen';
import ReceivedRequestsScreen from '../screens/Rental/ReceivedRequestsScreen';
import ReceivedRequestDetailScreen from '../screens/Rental/ReceivedRequestDetailScreen';
import TradeDetailScreen from '../screens/Rental/TradeDetailScreen';
import MyTradesScreen from '../screens/Rental/MyTradesScreen';
import MyPageScreen from '../screens/My/MyPageScreen';

import TabBar, { type TabKey } from '../components/common/TabBar';

import { DEMO_START_SCREEN } from '../mocks/demoScenario';
import type { TradeMethod } from '../types/rental';

export type MainTabParamList = {
  Home: undefined;
  MyTrades: undefined;
  MyPage: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ProfileSetup: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;

  ClothDetail: { clothId: string };
  CameraPreview: undefined;
  ClothRegister: undefined;
  ClothRegisterComplete: {clothId: string};

  RentalRequest: { clothId: string };
  RentalConfirm: {
    clothId: string;
    start: number;
    end: number;
    method: TradeMethod;
  };
  RentalComplete: undefined;
  ReceivedRequests: { clothId?: string } | undefined;
  ReceivedRequestDetail: { rentalId: string };
  TradeDetail: { rentalId: string };
};

// 탭 화면에서 스택 화면(상세 등)으로도 이동할 수 있도록 두 내비게이터 타입을 합칩니다
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ROUTES: Record<TabKey, keyof MainTabParamList> = { home: 'Home', trade: 'MyTrades', my: 'MyPage' };
const ROUTE_TABS: Record<keyof MainTabParamList, TabKey> = { Home: 'home', MyTrades: 'trade', MyPage: 'my' };

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <TabBar
          active={ROUTE_TABS[state.routeNames[state.index] as keyof MainTabParamList]}
          onPressTab={(key) => navigation.navigate(TAB_ROUTES[key])}
        />
      )}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyTrades" component={MyTradesScreen} />
      <Tab.Screen name="MyPage" component={MyPageScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={
        __DEV__ && DEMO_START_SCREEN === 'camera'
          ? 'CameraPreview'
          : 'Login'
      }
    >
      {__DEV__ && (
        <Stack.Screen
          name="CameraPreview"
          component={CameraPreviewScreen}
          options={{ headerShown: false }}
        />
      )}

      <Stack.Screen name="ClothRegister" component={ClothRegisterScreen} options={{headerShown:false,gestureEnabled:false}} />
      <Stack.Screen name="ClothRegisterComplete" component={ClothRegisterCompleteScreen} options={{headerShown:false,gestureEnabled:false}} />

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
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ClothDetail"
        component={ClothDetailScreen}
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

      <Stack.Screen
        name="ReceivedRequests"
        component={ReceivedRequestsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ReceivedRequestDetail"
        component={ReceivedRequestDetailScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="TradeDetail"
        component={TradeDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
