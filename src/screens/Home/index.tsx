import { useCallback } from 'react';
import { TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Parcel, ParcelStatusEnum } from '../../types';

import { useAppDispatch, useAppSelector } from '../../stores';

import { parcelStatusEnumToString, screens } from '../../constants';

import styles from './styles';
import { useCreateOneMutation, useGetHistoriesQuery } from '../../services/parcel';
import { setAccessToken, setRefreshToken } from '../../utils/token';
import { setIsLogin, setUser } from '../../stores/auth';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const statusColor = {
  [ParcelStatusEnum.Draft]: '#fca5a5',
  [ParcelStatusEnum.WaitingForCourier]: '#fdba74',
  [ParcelStatusEnum.PickUp]: '#fcd34d',
  [ParcelStatusEnum.OnGoing]: '#bef264',
  [ParcelStatusEnum.Arrived]: '#86efac',
  [ParcelStatusEnum.Done]: '#6ee7b7',
};

const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const dispatch = useAppDispatch();

  const { data, refetch, isLoading: isGetHistoriesLoading } = useGetHistoriesQuery({}, {
    refetchOnFocus: true,
  });
  const [triggerCreateOneMutation, { isLoading: isCreateOneLoading }] = useCreateOneMutation();

  const user = useAppSelector((state) => state.auth.user);

  const onPressCreateNew = useCallback(() => {
    triggerCreateOneMutation({ senderId: user!.id }).then(() => {
      refetch();
    });
  }, [user]);

  const onPressLogout = useCallback(async () => {
    await setAccessToken('');
    await setRefreshToken('');
    dispatch(setIsLogin({ isLogin: false }));
    dispatch(setUser({ user: null }));
  }, []);

  const onPressGoToDetail = useCallback((parcel: Parcel) => {
    navigation.navigate(screens.parcel, parcel);
  }, [navigation]);

  const isLoading = isGetHistoriesLoading || isCreateOneLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.headerTitle}>
          {user?.name}
        </Text>
        <Button onPress={onPressLogout}>
          Log Out
        </Button>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Button onPress={onPressCreateNew} disabled={isLoading}>
          Create New
        </Button>
        {data?.histories && Object.entries(data?.histories).map(([k, v]) => (
          <TouchableOpacity
            key={k}
            onPress={() => onPressGoToDetail(v)}
            disabled={isLoading}
            style={[styles.parcelCard]}
          >
            <Text>
              {v.name.length > 0 ? v.name : 'Nameless Parcel'}
            </Text>
            <View style={[styles.parcelStatus, { backgroundColor: statusColor[v.status] }]}>
              <Text>
                {parcelStatusEnumToString(v.status)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
