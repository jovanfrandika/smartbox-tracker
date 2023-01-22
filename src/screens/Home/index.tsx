import { useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

import { useAppDispatch, useAppSelector } from '../../stores';

import { screens } from '../../constants';

import styles from './styles';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  const onPressGoToDetail = useCallback((parcelId: string) => {
    navigation.navigate(screens.parcel, { parcelId });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.headerTitle}>
          {user?.name}
        </Text>
      </View>
      <View style={styles.container}>
        {}
      </View>
    </SafeAreaView>
  );
};

export default Home;
