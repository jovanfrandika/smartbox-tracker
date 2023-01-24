import { useEffect, useState } from 'react';
import { Text } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import axios from 'axios';

import HomeScreen from './Home';
import ParcelScreen from './Parcel';
import LoginScreen from './Login';
import RegisterScreen from './Register';

import { screens } from '../constants';

import { useAppSelector } from '../stores';
import { useLazyMeQuery } from '../services/auth';

import type { RootStackParamList } from '../types';
import { initToken } from '../utils/token';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Screens = () => {
  const [triggerMe, { isLoading }] = useLazyMeQuery();
  const [hasInitToken, setHasInitToken] = useState(false);

  const isLogin = useAppSelector((state) => state.auth.isLogin);

  useEffect(() => {
    if (isLogin) {
      initToken().then(async () => {
        await triggerMe({});
        setHasInitToken(true);
      });
    }
    (axios.get('https://smartbox.frandika.com/ping'));
  }, [isLogin]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isLogin && hasInitToken ? (
          <>
            <Stack.Screen name={screens.home} component={HomeScreen} />
            <Stack.Screen name={screens.parcel} component={ParcelScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name={screens.login} component={LoginScreen} />
            <Stack.Screen name={screens.register} component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Screens;
