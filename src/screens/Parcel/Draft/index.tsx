import {
  useEffect, useMemo, useState, useRef, useCallback,
} from 'react';
import {
  RefreshControl, ScrollView, View,
} from 'react-native';
import {
  Button, List, Modal, Portal, Snackbar, TextInput,
} from 'react-native-paper';
import MapView, { Circle, Marker } from 'react-native-maps';

import {
  RawParcel,
  Parcel,
  Friend,
} from '../../../types';

import { useGetAllQuery } from '../../../services/friendship';

import styles from './styles';

import useGetLocation from '../../../hooks/useGetLocation';
import {
  useUpdateOneMutation,
  useUpdateProgressMutation,
} from '../../../services/parcel';
import { emptyId } from '../../../constants';

type Props = {
  parcel: Parcel,
  isLoading: boolean,
  refetch: () => Promise<any>;
};

type MapModalProps = {
  label: 'pickUpCoor' | 'arrivedCoor';
  data: RawParcel,
  isOpen: boolean;
  onHideModal: () => void;
  setData: React.Dispatch<React.SetStateAction<RawParcel>>;
}

const toNum = (str: string): number => +str.replace(/[^\d.-]/g, '');
const radius = 150;
const circleColor = '#80bfff';
const initialError = '';

const MapModal = ({
  label,
  data,
  isOpen,
  setData,
  onHideModal,
}: MapModalProps) => {
  const mapRef = useRef<MapView | null>(null);

  return (
    <Portal>
      <Modal visible={isOpen} onDismiss={onHideModal}>
        <View style={styles.mapContainer}>
          {data[label] !== null ? (
            <MapView
              ref={(ref) => {
                mapRef.current = ref as MapView;
              }}
              style={styles.map}
              onMapReady={() => {
                mapRef.current?.animateToRegion({
                  latitude: data[label]!.lat,
                  longitude: data[label]!.lng,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
                });
              }}
            >
              <Marker
                draggable
                title="End Point"
                pinColor={circleColor}
                coordinate={{ latitude: data[label]!.lat, longitude: data[label]!.lng }}
                onDragEnd={(e) => setData({
                  ...data,
                  [label]: {
                    ...data[label],
                    lat: e.nativeEvent.coordinate.latitude,
                    lng: e.nativeEvent.coordinate.longitude,
                  },
                })}
              />
              <Circle
                center={{ latitude: data[label]!.lat, longitude: data[label]!.lng }}
                radius={radius}
                strokeWidth={2}
                strokeColor={circleColor}
                fillColor={circleColor}
              />
            </MapView>
          ) : null}
        </View>
      </Modal>
    </Portal>
  );
};

const Draft = ({
  parcel,
  isLoading: isGetParcelLoading,
  refetch,
}: Props) => {
  const [data, setData] = useState<RawParcel>({
    id: parcel.id,
    name: parcel.name,
    description: parcel.description,
    pickUpCoor: null,
    arrivedCoor: null,
    pickUpPhoto: null,
    arrivedPhoto: null,
    tempThr: {
      low: 10,
      high: 40,
    },
    hmdThr: {
      low: 50,
      high: 100,
    },
    senderId: parcel.sender ? parcel.sender.id : emptyId,
    receiverId: parcel.receiver ? parcel.receiver.id : emptyId,
    courierId: parcel.courier ? parcel.courier.id : emptyId,
    deviceId: parcel.device ? parcel.device.id : emptyId,
    status: parcel.status,
  });

  const [isPickUpMapOpen, setIsPickUpMapOpen] = useState(false);
  const [isArrivedMapOpen, setIsArrivedMapOpen] = useState(false);

  const [error, setError] = useState(initialError);

  const {
    data: friendsData,
    isLoading: isGetFriendsLoading,
    refetch: refetchFriends,
  } = useGetAllQuery({}, {
    refetchOnMountOrArgChange: true,
  });

  const [triggerUpdateParcel] = useUpdateOneMutation({});
  const [triggerUpdateProgress] = useUpdateProgressMutation({});

  const { userLocation } = useGetLocation();

  const FriendList = useMemo(() => {
    const friends: Friend[] = [
      {
        friendUserId: emptyId,
        name: 'No One',
        email: 'example@example.com',
      },
    ];
    if (friendsData && friendsData.friends) {
      friends.push(...friendsData.friends);
    }
    return friends.map((friend) => (
      <List.Item
        key={friend.friendUserId}
        title={friend.name}
        description={friend.email}
        onPress={() => setData({
          ...data,
          receiverId: friend.friendUserId,
        })}
        style={[styles.spaceBottom, data.receiverId === friend.friendUserId && styles.active]}
        titleStyle={[data.receiverId === friend.friendUserId && styles.active]}
        descriptionStyle={[data.receiverId === friend.friendUserId && styles.active]}
      />
    ));
  }, [data, friendsData]);

  const onPressSave = useCallback(async () => {
    if (data.tempThr!.low > data.tempThr!.high) {
      setError('Invalid temperature');
      return;
    }
    if (data.hmdThr!.low > data.hmdThr!.high) {
      setError('Invalid humidity');
      return;
    }
    if (data.name.length < 3) {
      setError('Name too short');
      return;
    }
    if (data.description.length < 6) {
      setError('Description too short');
      return;
    }
    if (data.receiverId === emptyId) {
      setError('Receiver cannot be empty');
      return;
    }

    await triggerUpdateParcel(data);
  }, [data]);

  const onPressOrder = useCallback(async () => {
    await onPressSave();
    const res = await triggerUpdateProgress({ id: parcel.id });
    if ('data' in res) {
      refetch();
    }
  }, [onPressSave]);

  const isLoading = isGetParcelLoading || isGetFriendsLoading;

  useEffect(() => {
    if (userLocation !== null) {
      const newData = data;
      if (data.pickUpCoor === null) {
        newData.pickUpCoor = userLocation;
      }
      if (data.arrivedCoor === null) {
        newData.arrivedCoor = userLocation;
      }
      setData({ ...newData });
    }
  }, [userLocation]);

  return (
    <>
      <MapModal
        label="pickUpCoor"
        data={data}
        isOpen={isPickUpMapOpen}
        onHideModal={() => setIsPickUpMapOpen(false)}
        setData={setData}
      />
      <MapModal
        label="arrivedCoor"
        data={data}
        setData={setData}
        isOpen={isArrivedMapOpen}
        onHideModal={() => setIsArrivedMapOpen(false)}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              refetch();
              refetchFriends();
            }}
          />
        )}
      >
        <TextInput
          label="Name"
          mode="outlined"
          value={data.name}
          autoCapitalize="none"
          onChangeText={(newVal: string) => setData({ ...data, name: newVal })}
          style={styles.spaceBottom}
        />
        <TextInput
          label="Description"
          mode="outlined"
          value={data.description}
          autoCapitalize="none"
          onChangeText={(newVal: string) => setData({ ...data, description: newVal })}
          style={styles.spaceBottom}
        />
        <View style={[styles.row, styles.spaceBottom]}>
          <Button mode="contained" onPress={() => setIsPickUpMapOpen(true)} style={[styles.rowItem]}>
            Change pick up
          </Button>
          <View style={styles.rowSpace} />
          <Button mode="contained" onPress={() => setIsArrivedMapOpen(true)} style={[styles.rowItem]}>
            Change destination
          </Button>
        </View>
        <View style={styles.row}>
          <TextInput
            label="Lowest Temp"
            mode="outlined"
            value={data.tempThr!.low.toString()}
            autoCapitalize="none"
            onChangeText={(newVal: string) => setData({
              ...data,
              tempThr: {
                ...data.tempThr!,
                low: toNum(newVal),
              },
            })}
            style={[styles.spaceBottom, styles.rowItem]}
          />
          <View style={styles.rowSpace} />
          <TextInput
            label="Highest Temp"
            mode="outlined"
            value={data.tempThr!.high.toString()}
            autoCapitalize="none"
            onChangeText={(newVal: string) => setData({
              ...data,
              tempThr: {
                ...data.tempThr!,
                high: toNum(newVal),
              },
            })}
            style={[styles.spaceBottom, styles.rowItem]}
          />
        </View>
        <View style={styles.row}>
          <TextInput
            label="Lowest Humidity"
            mode="outlined"
            value={data.hmdThr!.low.toString()}
            autoCapitalize="none"
            onChangeText={(newVal: string) => setData({
              ...data,
              hmdThr: {
                ...data.hmdThr!,
                low: toNum(newVal),
              },
            })}
            style={[styles.spaceBottom, styles.rowItem]}
          />
          <View style={styles.rowSpace} />
          <TextInput
            label="Highest Humidity"
            mode="outlined"
            value={data.hmdThr!.high.toString()}
            autoCapitalize="none"
            onChangeText={(newVal: string) => setData({
              ...data,
              hmdThr: {
                ...data.hmdThr!,
                high: toNum(newVal),
              },
            })}
            style={[styles.spaceBottom, styles.rowItem]}
          />
        </View>
        <View>
          {FriendList}
        </View>
      </ScrollView>
      <View style={[styles.footer, styles.row]}>
        <Button
          onPress={onPressSave}
          style={styles.rowItem}
        >
          Save
        </Button>
        <View style={styles.rowSpace} />
        <Button
          mode="contained"
          onPress={onPressOrder}
          style={styles.rowItem}
        >
          Order
        </Button>
      </View>
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(initialError)}
      >
        {error}
      </Snackbar>
    </>
  );
};

export default Draft;
