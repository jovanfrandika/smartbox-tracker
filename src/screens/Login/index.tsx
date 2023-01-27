import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

import { useAppDispatch } from '../../stores';

import { useLoginMutation } from '../../services/auth';

import styles from './styles';

import { setIsLogin } from '../../stores/auth';

import { setAccessToken, setRefreshToken } from '../../utils/token';
import { screens } from '../../constants';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const keyboardVerticalOffset = 64;

const Login = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const [loginTrigger, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useAppDispatch();

  const onPress = useCallback(async () => {
    const res = await loginTrigger({ email, password });
    if ('error' in res) {
      return;
    }

    await setAccessToken(res.data.accessToken);
    await setRefreshToken(res.data.refreshToken);
    dispatch(setIsLogin({ isLogin: true }));
  }, [email, password, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View>
          <Text
            variant="displayLarge"
            style={styles.textCenter}
          >
            Login
          </Text>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <TextInput
            label="Email"
            mode="outlined"
            value={email}
            autoCapitalize="none"
            onChangeText={(newVal: string) => setEmail(newVal)}
            style={styles.spaceBottom}
          />
          <TextInput
            label="Password"
            mode="outlined"
            secureTextEntry
            value={password}
            onChangeText={(newVal: string) => setPassword(newVal)}
            style={styles.spaceBottom}
          />
          <Button
            mode="contained"
            onPress={onPress}
            disabled={(email.length < 1 && password.length < 6) || isLoading}
          >
            Login
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.navigate(screens.register)}
          >
            Register
          </Button>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default Login;
