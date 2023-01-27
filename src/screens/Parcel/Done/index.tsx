import { useMemo, useRef } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Parcel, ParcelStatusEnum } from '../../../types';
import { useGetAllQuery } from '../../../services/parcelTravel';
import styles from './styles';
import { statusColor } from '../../../constants';
import ParcelInfo from '../components/ParcelInfo';

type Props = {
  parcel: Parcel,
  isLoading: boolean,
  refetch: () => Promise<any>;
};

const Done = ({
  parcel,
  isLoading: isGetParcelLoading,
  refetch,
}: Props) => {
  const {
    data: parcelTravelData,
    isLoading: isGetParcelDataLoading,
  } = useGetAllQuery({
    parcelId: parcel.id,
  });

  const mapRef = useRef<MapView | null>(null);

  const parcelTrails = useMemo(() => (
    parcelTravelData?.parcelTravels && parcelTravelData?.parcelTravels.map((deviceDatum, idx) => (
      deviceDatum.coor ? (
        <Marker
          key={`${idx + 1}-${deviceDatum.coor.lat}-${deviceDatum.coor.lng}`}
          title={`Device at ${new Date(deviceDatum.ts).toTimeString()}`}
          pinColor={statusColor[ParcelStatusEnum.OnGoing]}
          coordinate={{ latitude: deviceDatum.coor.lat, longitude: deviceDatum.coor.lng }}
        />
      ) : null
    ))), [parcelTravelData]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      stickyHeaderIndices={[0]}
      invertStickyHeaders
      refreshControl={(
        <RefreshControl
          refreshing={isGetParcelLoading || isGetParcelDataLoading}
          onRefresh={() => {
            refetch();
          }}
        />
      )}
    >
      <MapView
        ref={(ref) => {
          mapRef.current = ref as MapView;
        }}
        style={[styles.map, styles.spaceBottom]}
        onMapReady={() => {
          mapRef.current?.animateToRegion({
            latitude: (parcel.pickUpCoor!.lat + parcel.arrivedCoor!.lat) / 2,
            longitude: (parcel.pickUpCoor!.lng + parcel.arrivedCoor!.lng) / 2,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          });
        }}
      >
        <Marker
          title="Pick Up"
          pinColor={statusColor[ParcelStatusEnum.PickUp]}
          coordinate={{
            latitude: parcel.pickUpCoor!.lat,
            longitude: parcel.pickUpCoor!.lng,
          }}
        />
        <Marker
          title="Destination"
          pinColor={statusColor[ParcelStatusEnum.Arrived]}
          coordinate={{
            latitude: parcel.arrivedCoor!.lat,
            longitude: parcel.arrivedCoor!.lng,
          }}
        />
        {parcelTrails}
      </MapView>
      <ParcelInfo
        id={parcel.id}
        name={parcel.name}
        description={parcel.description}
        pickUpCoor={parcel.pickUpCoor}
        arrivedCoor={parcel.arrivedCoor}
        pickUpPhoto={parcel.pickUpPhoto}
        arrivedPhoto={parcel.arrivedPhoto}
        tempThr={parcel.tempThr}
        hmdThr={parcel.hmdThr}
        sender={parcel.sender}
        receiver={parcel.receiver}
        courier={parcel.courier}
        device={parcel.device}
        status={parcel.status}
        parcelTravels={parcelTravelData?.parcelTravels ? parcelTravelData.parcelTravels : []}
      />
    </ScrollView>
  );
};

export default Done;
