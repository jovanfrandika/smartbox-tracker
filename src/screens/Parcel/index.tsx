import { useState } from 'react';
import { Button, Snackbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View } from 'react-native';
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

type ParcelScreenRouteProp = RouteProp<RootStackParamList, 'Parcel'>;

const initialError = '';

const Parcel = () => {
  const navigation = useNavigation();
  const route = useRoute<ParcelScreenRouteProp>();

  const [parcel, setParcel] = useState(route.params);

  const { status } = route.params;

  const [error, setError] = useState<string>(initialError);

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
          Smartbox
        </Text>
      </View>
      {status === ParcelStatusEnum.Draft ? (
        <Draft
          parcel={parcel}
          setParcel={setParcel}
        />
      ) : null}
      {status === ParcelStatusEnum.WaitingForCourier ? (
        <WaitingForCourier
          parcel={parcel}
          setParcel={setParcel}
        />
      ) : null}
      {status === ParcelStatusEnum.PickUp ? (
        <PickUp
          parcel={parcel}
          setParcel={setParcel}
        />
      ) : null}
      {status === ParcelStatusEnum.OnGoing ? (
        <OnGoing
          parcel={parcel}
          setParcel={setParcel}
        />
      ) : null}
      {status === ParcelStatusEnum.Arrived ? (
        <Arrived />
      ) : null}
      {status === ParcelStatusEnum.Done ? (
        <Done parcel={parcel} />
      ) : null}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(initialError)}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
};

export default Parcel;
