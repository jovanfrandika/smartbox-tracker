import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

import { useAppDispatch } from '../../stores';

import { useRegisterMutation } from '../../services/auth';

import styles from './styles';

import { setIsLogin } from '../../stores/auth';

import { setAccessToken, setRefreshToken } from '../../utils/token';
import { userRole } from '../../constants';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const keyboardVerticalOffset = 64;

const Register = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const [registerTrigger, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(userRole.customer);

  const dispatch = useAppDispatch();

  const onPress = useCallback(async () => {
    const res = await registerTrigger({
      name,
      email,
      password,
      role,
    });

    if ('error' in res) {
      return;
    }

    setAccessToken(res.data.accessToken);
    setRefreshToken(res.data.refreshToken);
    dispatch(setIsLogin({ isLogin: true }));
  }, [name, email, password, name, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View>
          <Text
            variant="displayLarge"
            style={styles.textCenter}
          >
            Register
          </Text>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <TextInput
            label="Name"
            mode="outlined"
            value={name}
            autoCapitalize="none"
            onChangeText={(newVal: string) => setName(newVal)}
            style={styles.spaceBottom}
          />
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
            mode={role === userRole.customer ? 'contained' : 'outlined'}
            onPress={() => {
              setRole(userRole.customer);
            }}
          >
            Customer
          </Button>
          <Button
            mode={role === userRole.courier ? 'contained' : 'outlined'}
            onPress={() => {
              setRole(userRole.courier);
            }}
          >
            Courier
          </Button>
          <Button
            mode="contained"
            onPress={onPress}
            disabled={(name.length < 3 && email.length < 1 && password.length < 6) || isLoading}
          >
            Register
          </Button>
          <Button
            mode="text"
            onPress={navigation.goBack}
          >
            Login
          </Button>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default Register;
