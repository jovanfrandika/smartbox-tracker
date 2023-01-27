import { useCallback, useEffect } from 'react';
import {
  TouchableOpacity, View, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  RootStackParamList,
  Parcel,
  UserRoleEnum,
} from '../../types';

import { useAppDispatch, useAppSelector } from '../../stores';

import { parcelStatusEnumToString, screens, statusColor } from '../../constants';

import styles from './styles';
import { useCreateOneMutation, useGetHistoriesQuery, useLazyGetNearbyPickUpsQuery } from '../../services/parcel';
import { setAccessToken, setRefreshToken } from '../../utils/token';
import { setIsLogin, setUser } from '../../stores/auth';
import useGetLocation from '../../hooks/useGetLocation';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const user = useAppSelector((state) => state.auth.user);

  const { userLocation } = useGetLocation();

  const dispatch = useAppDispatch();

  const {
    data: historyData,
    refetch: refetchHistories,
    isLoading: isGetHistoriesLoading,
  } = useGetHistoriesQuery({}, {
    refetchOnFocus: true,
  });

  const [triggerCreateOneMutation, { isLoading: isCreateOneLoading }] = useCreateOneMutation();

  const [
    triggerGetNearbyPickUps,
    {
      data: nearbyPickUpsData,
      isLoading: isGetNearbyPickUpsLoading,
    },
  ] = useLazyGetNearbyPickUpsQuery({});

  const onPressCreateNew = useCallback(() => {
    triggerCreateOneMutation({ senderId: user!.id }).then(() => {
      refetchHistories();
    });
  }, [user]);

  const onPressLogout = useCallback(async () => {
    await setAccessToken('');
    await setRefreshToken('');
    dispatch(setIsLogin({ isLogin: false }));
    dispatch(setUser({ user: null }));
  }, []);

  const onPressGoToDetail = useCallback((parcel: Parcel) => {
    navigation.navigate(screens.parcel, { parcelId: parcel.id });
  }, [navigation]);

  useEffect(() => {
    if (user?.role === UserRoleEnum.Courier && userLocation !== null) {
      triggerGetNearbyPickUps({ userLoc: userLocation });
    }
  }, [userLocation]);

  const isLoading = isGetHistoriesLoading || isGetNearbyPickUpsLoading || isCreateOneLoading;

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
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              refetchHistories();
              if (user?.role === UserRoleEnum.Courier && userLocation !== null) {
                triggerGetNearbyPickUps({ userLoc: userLocation });
              }
            }}
          />
        )}
      >
        {user?.role === UserRoleEnum.Courier ? (
          <>
            <Text variant="titleMedium" style={styles.headerTitle}>
              Nearby Pick Ups
            </Text>
            {nearbyPickUpsData?.parcels && Object.entries(nearbyPickUpsData?.parcels).map(
              ([k, v]) => (
                <TouchableOpacity
                  key={k}
                  onPress={() => onPressGoToDetail(v)}
                  disabled={isGetNearbyPickUpsLoading}
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
              ),
            )}
          </>
        ) : null}
        {user?.role === UserRoleEnum.Customer ? (
          <Button onPress={onPressCreateNew} disabled={isLoading}>
            Create New
          </Button>
        ) : null}
        <Text variant="titleMedium" style={styles.headerTitle}>
          History
        </Text>
        {historyData?.histories && Object.entries(historyData.histories).map(([k, v]) => (
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
