import { useState } from 'react';
import { Button, Snackbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import type { RouteProp } from '@react-navigation/native';
import {
  ParcelStatusEnum,
  RootStackParamList,
} from '../../types';

import Draft from './Draft';
import WaitingForCourier from './WaitingForCourier';
import PickUp from './PickUp';
import OnGoing from './OnGoing';
import Arrived from './Arrived';
import Done from './Done';

import styles from './styles';
import { useGetOneQuery } from '../../services/parcel';
import { parcelStatusEnumToString } from '../../constants';
import { useAppSelector } from '../../stores';

type ParcelScreenRouteProp = RouteProp<RootStackParamList, 'Parcel'>;

const initialError = '';

const Parcel = () => {
  const navigation = useNavigation();
  const route = useRoute<ParcelScreenRouteProp>();

  const { data: parcel, isLoading, refetch } = useGetOneQuery({
    id: route.params.parcelId,
  });

  const user = useAppSelector((state) => state.auth.user);

  const status = parcel?.status;

  const [error, setError] = useState<string>(initialError);

  if (parcel === undefined) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Button
            onPress={navigation.goBack}
            style={styles.headerBack}
          >
            Back
          </Button>
          <Text variant="titleMedium" style={styles.headerTitle}>
            {user?.name}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Button
          onPress={navigation.goBack}
          style={styles.headerBack}
        >
          Back
        </Button>
        <Text variant="titleMedium" style={styles.headerTitle}>
          {parcelStatusEnumToString(parcel.status)}
        </Text>
        <Text variant="titleMedium" style={styles.headerTitle}>
          {user?.name}
        </Text>
      </View>
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(initialError)}
      >
        {error}
      </Snackbar>
      {status === ParcelStatusEnum.Draft ? (
        <Draft
          parcel={parcel!}
          isLoading={isLoading}
          refetch={refetch}
        />
      ) : null}
      {status === ParcelStatusEnum.WaitingForCourier ? (
        <WaitingForCourier
          parcel={parcel!}
          isLoading={isLoading}
          refetch={refetch}
        />
      ) : null}
      {status === ParcelStatusEnum.PickUp ? (
        <PickUp
          parcel={parcel!}
          isLoading={isLoading}
          refetch={refetch}
        />
      ) : null}
      {status === ParcelStatusEnum.OnGoing ? (
        <OnGoing
          parcel={parcel!}
          isLoading={isLoading}
          refetch={refetch}
        />
      ) : null}
      {status === ParcelStatusEnum.Arrived ? (
        <Arrived
          parcel={parcel!}
          isLoading={isLoading}
          refetch={refetch}
        />
      ) : null}
      {status === ParcelStatusEnum.Done ? (
        <Done
          parcel={parcel!}
          isLoading={isLoading}
          refetch={refetch}
        />
      ) : null}
    </SafeAreaView>
  );
};

export default Parcel;
