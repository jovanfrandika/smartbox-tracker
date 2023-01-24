import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { ScrollView } from 'react-native';
import {
  Button, Snackbar, Text, TextInput,
} from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';

import { Coordinate, Parcel, ParcelStatusEnum } from '../../../types';
import { useAppSelector } from '../../../stores';
import { useSendParcelCodeToReceiverMutation, useVerifyParcelCodeMutation } from '../../../services/parcel';
import styles from './styles';

import useGetLocation from '../hooks/useGetLocation';
import useCountdown from '../hooks/useCountdown';
import { useGetAllQuery } from '../../../services/parcelTravel';
import { getCrowInMeters } from '../utils';

type Props = {
  parcel: Parcel,
  setParcel: React.Dispatch<React.SetStateAction<Parcel>>;
};

const initialError = '';
const pollingInterval = 30000;
const destRadius = 150;
const countdown = 60;
const countdownInterval = 1000;

const OnGoing = ({ parcel, setParcel }: Props) => {
  const user = useAppSelector((state) => state.auth.user);

  const [code, setCode] = useState('');
  const [error, setError] = useState(initialError);
  const { userLocation } = useGetLocation();

  const { data: parcelTravelData } = useGetAllQuery({}, {
    pollingInterval,
  });

  const [
    count,
    start,
  ] = useCountdown(countdown, countdownInterval);

  const [
    triggerSendCode,
    { isLoading: isSendCodeLoading, isError: isSendCodeError },
  ] = useSendParcelCodeToReceiverMutation({});

  const [
    triggerVerifyCode,
    { isLoading: isVerifyCodeLoading, isError: isVerifyCodeError },
  ] = useVerifyParcelCodeMutation({});

  const parcelTrails = useMemo(() => parcelTravelData?.parcelTravels.map((deviceDatum, idx) => (
    deviceDatum.coordinate ? (
      <Marker
        key={`${idx + 1}-${deviceDatum.coordinate.lat}-${deviceDatum.coordinate.lng}`}
        title={`${idx + 1}`}
        coordinate={{ latitude: deviceDatum.coordinate.lat, longitude: deviceDatum.coordinate.lng }}
      />
    ) : null
  )), [parcelTravelData]);

  const hasReachEnd = useMemo(() => {
    if (!parcelTravelData || parcelTravelData?.parcelTravels.length === 0) {
      return false;
    }
    const lastTrail = parcelTravelData.parcelTravels[parcelTravelData.parcelTravels.length - 1];
    if (!lastTrail.coordinate) {
      return false;
    }
    const lastTrailLocation: Coordinate = {
      lat: lastTrail.coordinate.lat,
      lng: lastTrail.coordinate.lng,
    };
    const distance = getCrowInMeters(
      lastTrailLocation,
      {
        lat: parcel.end!.lat,
        lng: parcel.end!.long,
      },
    ) * 1000;
    return distance <= destRadius;
  }, [parcelTravelData]);

  const onPressSendCode = useCallback(() => {
    triggerSendCode({ id: parcel.id });
    start();
  }, []);

  const onPressVerifyCode = useCallback(async () => {
    const res = await triggerVerifyCode({ id: parcel.id, code });
    if (!('error' in res)) {
      setParcel((prevData) => ({
        ...prevData,
        status: ParcelStatusEnum.Arrived,
      }));
    }
  }, [code]);

  const isLoading = isSendCodeLoading || isVerifyCodeLoading;

  useEffect(() => {
    if (isSendCodeError || isVerifyCodeError) {
      setError('Oops, a problem occured');
    }
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      stickyHeaderIndices={[0]}
      invertStickyHeaders
    >
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(initialError)}
      >
        {error}
      </Snackbar>
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
        {parcelTrails}
      </MapView>
      {parcel.courier?.id === user?.id ? (
        <>
          {count !== countdown && hasReachEnd ? (
            <Text>
              {`Wait for ${count} second(s)`}
            </Text>
          ) : null}
          <Button
            onPress={onPressSendCode}
            disabled={count !== countdown || !hasReachEnd}
          >
            Send Code to Receiver
          </Button>
        </>
      ) : null}
      {parcel.receiver?.id === user?.id ? (
        <>
          <TextInput
            label="code"
            keyboardType="numeric"
            value={code}
            onChangeText={(newCode) => setCode(newCode)}
            style={styles.spaceBottom}
          />
          <Button
            onPress={onPressVerifyCode}
            disabled={isLoading || code.length < 6}
          >
            Verify Code
          </Button>
        </>
      ) : null}
    </ScrollView>
  );
};

export default OnGoing;
