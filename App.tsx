import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { API_DEMO_MODE } from './src/constants/demoMode';
import { useRentalState } from './src/state/rentalStore';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  const { currentUserId } = useRentalState();
  const [fontsLoaded] = useFonts({
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.otf'),
    'Pretendard-ExtraBold': require('./assets/fonts/Pretendard-ExtraBold.otf'),
    'Pretendard-Medium': require('./assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-Regular': require('./assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer key={API_DEMO_MODE ? currentUserId : 'session'}>
      <RootNavigator />
    </NavigationContainer>
  );
}
