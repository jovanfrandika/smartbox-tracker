import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

import { screens } from '../../constants';

import styles from './styles';

import * as appPackage from '../../../package.json';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const keyboardVerticalOffset = 64;

const initialBrokerUrl = 'ws://127.0.0.1:9001';

const version = appPackage.version;

const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [deviceName, setDeviceName] = useState<string>('');
  const [brokerUrl, setBrokerUrl] = useState<string>(initialBrokerUrl);

  const onPress = useCallback(() => {
    navigation.navigate(screens.device, { deviceName, brokerUrl });
  }, [deviceName, brokerUrl, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View>
          <Text
            variant="displayLarge"
            style={styles.textCenter}
          >
            Smartbox Demo App
          </Text>
          <Text style={styles.textCenter}>
            Version {version}
          </Text>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <TextInput
            label="Broker Url"
            mode="outlined"
            value={brokerUrl}
            onChangeText={(newVal: string) => setBrokerUrl(newVal)}
            style={styles.spaceBottom}
          />
          <TextInput
            label="Device Name"
            mode="outlined"
            value={deviceName}
            onChangeText={(newVal: string) => setDeviceName(newVal)}
            style={styles.spaceBottom}
          />
          <Button
            mode="contained"
            onPress={onPress}
            disabled={deviceName.length === 0 && brokerUrl.length === 0}
          >
            Try Connect
          </Button>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default Home;
