import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import HomeScreen from './Home';
import DeviceScreen from './Device';

import { screens } from '../constants';

import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Screens = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={screens.home} component={HomeScreen} />
      <Stack.Screen name={screens.device} component={DeviceScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default Screens;
