import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Button, Snackbar, Text,
} from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';

import { Parcel } from '../../../types';
import { useAppSelector } from '../../../stores';
import { useOpenDoorMutation, useUpdateProgressMutation } from '../../../services/parcel';
import styles from './styles';
import useGetLocation from '../hooks/useGetLocation';

type Props = {
  parcel: Parcel,
  setParcel: React.Dispatch<React.SetStateAction<Parcel>>;
};

const initialError = '';

const WaitingForCourier = ({ parcel, setParcel }: Props) => {
  const user = useAppSelector((state) => state.auth.user);

  if (parcel.receiver?.id === user?.id) {
    return (
      <View>
        <Text>
          Menunggu kurir ke pick up...
        </Text>
      </View>
    );
  }

  if (parcel.sender?.id === user?.id) {
    const [triggerOpenDoor, { isLoading: isOpenDoorLoading }] = useOpenDoorMutation({});
    const [
      triggerUpdateProgress,
      { isLoading: isUpdateProgressLoading },
    ] = useUpdateProgressMutation({});

    const [error, setError] = useState(initialError);

    const onPressOrder = useCallback(async () => {
      const res = await triggerUpdateProgress({});
      if ('data' in res) {
        setParcel(res.data.parcel);
      } else {
        setError('Network problem');
      }
    }, []);

    const isLoading = isOpenDoorLoading || isUpdateProgressLoading;

    return (
      <View>
        <Snackbar
          visible={!!error}
          onDismiss={() => setError(initialError)}
        >
          {error}
        </Snackbar>
        <Text>
          Menunggu kurir ke pick up
        </Text>
        <View style={styles.row}>
          <Button onPress={() => triggerOpenDoor({ id: parcel.id })} disabled={isLoading}>
            Open Door
          </Button>
          <Button onPress={onPressOrder} disabled={isLoading}>
            Start delivery
          </Button>
        </View>
      </View>
    );
  }

  const { userLocation } = useGetLocation();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      stickyHeaderIndices={[0]}
      invertStickyHeaders
    >
      <Text>
        {parcel.name}
      </Text>
      <MapView>
        {userLocation !== null ? (
          <Marker
            title="Your location"
            coordinate={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            }}
          />
        ) : null}
        <Marker
          title="Pick Up"
          coordinate={{
            latitude: parcel.start!.lat,
            longitude: parcel.start!.long,
          }}
        />
        <Marker
          title="Destination"
          coordinate={{
            latitude: parcel.end!.lat,
            longitude: parcel.end!.long,
          }}
        />
      </MapView>
    </ScrollView>
  );
};

export default WaitingForCourier;
