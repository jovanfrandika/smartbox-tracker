import {
  useEffect, useMemo, useState, useRef, useCallback,
} from 'react';
import {
  Image, Platform, RefreshControl, ScrollView, View,
} from 'react-native';
import {
  Button, List, Modal, Portal, Snackbar, TextInput,
} from 'react-native-paper';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import MapView, { Circle, Marker } from 'react-native-maps';

import {
  RawParcel,
  Parcel,
  Friend,
} from '../../../types';

import { useGetAllQuery } from '../../../services/friendship';

import styles, { cameraSize } from './styles';

import useGetLocation from '../hooks/useGetLocation';
import useCameraPermission from '../hooks/useCameraPermission';
import {
  useCheckPhotoMutation,
  useGetPhotoSignedUrlMutation,
  useUpdateOneMutation,
  useUpdateProgressMutation,
} from '../../../services/parcel';
import { usePutPhotoMutation } from '../../../services/gcp';
import { emptyId } from '../../../constants';

type Props = {
  parcel: Parcel,
  setParcel: React.Dispatch<React.SetStateAction<Parcel>>;
};

type MapModalProps = {
  label: 'start' | 'end';
  data: RawParcel,
  isOpen: boolean;
  onHideModal: () => void;
  setData: React.Dispatch<React.SetStateAction<RawParcel>>;
}

type CameraModalProps = {
  parcelId: string;
  hasCameraPermission: boolean;
  isOpen: boolean;
  onHideModal: () => void;
  setData: React.Dispatch<React.SetStateAction<RawParcel>>;
}

const storageHost = 'https://storage.googleapis.com/smartbox/';
const toNum = (str: string): number => +str.replace(/[^\d.-]/g, '');
const radius = 150;
const circleColor = '#80bfff';
const initialError = '';

const MapModal = ({
  label,
  data,
  setData,
  isOpen,
  onHideModal,
}: MapModalProps) => {
  const mapRef = useRef<MapView | null>(null);
  return (
    <Portal>
      <Modal visible={isOpen} onDismiss={onHideModal}>
        <View style={styles.mapContainer}>
          <MapView
            ref={(ref) => {
              mapRef.current = ref as MapView;
            }}
            style={styles.map}
            onMapReady={() => {
              mapRef.current?.animateToRegion({
                latitude: data[label].lat,
                longitude: data[label].long,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              });
            }}
          >
            <Marker
              draggable
              title="End Point"
              pinColor={circleColor}
              coordinate={{ latitude: data[label].lat, longitude: data[label].long }}
              onDragEnd={(e) => setData({
                ...data,
                [label]: {
                  ...data[label],
                  lat: e.nativeEvent.coordinate.latitude,
                  long: e.nativeEvent.coordinate.longitude,
                },
              })}
            />
            <Circle
              center={{ latitude: data[label].lat, longitude: data[label].long }}
              radius={radius}
              strokeWidth={2}
              strokeColor={circleColor}
              fillColor={circleColor}
            />
          </MapView>
        </View>
      </Modal>
    </Portal>
  );
};

const CameraModal = ({
  parcelId, hasCameraPermission, isOpen, onHideModal, setData,
}: CameraModalProps) => {
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices('ultra-wide-angle-camera');

  const [
    triggerGetPhotoSignedUrl, { isLoading: isTriggerGetPhotoSignedUrlLoading },
  ] = useGetPhotoSignedUrlMutation({});
  const [triggerPutPhoto, { isLoading: isTriggerPutPhotoLoading }] = usePutPhotoMutation({});
  const [
    triggerCheckPhoto, { isLoading: isTriggerCheckPhotoLoading },
  ] = useCheckPhotoMutation({});

  const onPressTakePicture = async () => {
    try {
      const photo = await cameraRef.current?.takeSnapshot({
        flash: 'off',
        quality: 50,
      });

      if (!photo) {
        throw new Error('No Photo Taken');
      }

      let res: any;
      res = await triggerGetPhotoSignedUrl({ id: parcelId });
      if ('error' in res) {
        throw new Error(res.error);
      }

      const photoPath = Platform.OS === 'ios' ? photo!.path : `file://${photo!.path}`;
      res = await triggerPutPhoto({ url: res.data!.url, photoPath });

      res = await triggerCheckPhoto({ id: parcelId });

      setData((prevData) => ({
        ...prevData,
        isPhotoValid: true,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const isLoading = isTriggerGetPhotoSignedUrlLoading
    || isTriggerPutPhotoLoading
    || isTriggerCheckPhotoLoading;

  const onDismiss = () => {
    if (!isLoading) {
      onHideModal();
    }
  };

  return (
    <Portal>
      <Modal visible={isOpen} onDismiss={onDismiss}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={devices.back!}
          isActive={isOpen && hasCameraPermission}
          format={{
            photoHeight: cameraSize,
            photoWidth: cameraSize,
            videoHeight: cameraSize,
            videoWidth: cameraSize,
            minISO: 25,
            maxISO: 1600,
            fieldOfView: 73.81222877530534,
            pixelFormat: '420v',
            supportsPhotoHDR: false,
            supportsVideoHDR: false,
            isHighestPhotoQualitySupported: false,
            colorSpaces: ['raw'],
            frameRateRanges: [
              { maxFrameRate: 30, minFrameRate: 1 },
              { maxFrameRate: 30, minFrameRate: 30 },
            ],
            autoFocusSystem: 'none',
            maxZoom: 8,
            videoStabilizationModes: ['off'],
          }}
          photo
        />
        <Button onPress={onPressTakePicture} disabled={isLoading}>
          Take Picture
        </Button>
      </Modal>
    </Portal>
  );
};

const Draft = ({ parcel, setParcel }: Props) => {
  const [data, setData] = useState<RawParcel>({
    id: parcel.id,
    name: parcel.name,
    description: parcel.description,
    photoUri: parcel.photoUri,
    isPhotoValid: parcel.isPhotoValid,
    start: {
      lat: 0,
      long: 0,
      temp: 10,
      humid: 50,
    },
    end: {
      lat: 0,
      long: 0,
      temp: 30,
      humid: 100,
    },
    senderId: parcel.sender ? parcel.sender.id : emptyId,
    receiverId: parcel.receiver ? parcel.receiver.id : emptyId,
    courierId: parcel.courier ? parcel.courier.id : emptyId,
    deviceId: parcel.device ? parcel.device.id : emptyId,
    status: parcel.status,
  });

  const [isStartMapOpen, setIsStartMapOpen] = useState(false);
  const [isEndMapOpen, setIsEndMapOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [error, setError] = useState(initialError);

  const { data: friendsData, isLoading, refetch } = useGetAllQuery({}, {
    refetchOnMountOrArgChange: true,
  });

  const [triggerUpdateParcel] = useUpdateOneMutation({});
  const [triggerUpdateProgress] = useUpdateProgressMutation({});

  const { userLocation } = useGetLocation();
  const { hasCameraPermission } = useCameraPermission();

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
        title={`${friend.name} ${data.receiverId === friend.friendUserId ? '(Selected)' : ''}`}
        description={friend.email}
        onPress={() => setData({
          ...data,
          receiverId: friend.friendUserId,
        })}
      />
    ));
  }, [data, friendsData]);

  const onPressSave = useCallback(async () => {
    if (data.start.temp > data.end.temp) {
      setError('Invalid temperature');
      return;
    }
    if (data.start.humid > data.end.humid) {
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
    if (!data.isPhotoValid) {
      setError('Photo is invalid');
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
    const res = await triggerUpdateProgress({});
    if ('data' in res) {
      setParcel(res.data.parcel);
    }
  }, [onPressSave]);

  const is = isLoading;

  useEffect(() => {
    if (userLocation) {
      const newData = data;
      if (data.start.lat === 0 && data.start.long === 0) {
        newData.start.lat = userLocation.lat;
        newData.start.long = userLocation.lng;
      }
      if (data.end.lat === 0 && data.end.long === 0) {
        newData.end.lat = userLocation.lat;
        newData.end.long = userLocation.lng;
      }
      setData({ ...newData });
    }
  }, [userLocation]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={(
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => refetch()}
        />
      )}
      stickyHeaderIndices={[0]}
      invertStickyHeaders
    >
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(initialError)}
      >
        {error}
      </Snackbar>
      <CameraModal
        parcelId={data.id}
        hasCameraPermission={hasCameraPermission}
        isOpen={isCameraOpen}
        onHideModal={() => setIsCameraOpen(false)}
        setData={setData}
      />
      <MapModal
        label="start"
        data={data}
        isOpen={isStartMapOpen}
        onHideModal={() => setIsStartMapOpen(false)}
        setData={setData}
      />
      <MapModal
        label="end"
        data={data}
        setData={setData}
        isOpen={isEndMapOpen}
        onHideModal={() => setIsEndMapOpen(false)}
      />
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
      {data.isPhotoValid ? (
        <Image
          source={{ uri: `${storageHost}${data.photoUri}` }}
          style={styles.image}
        />
      ) : null}
      <Button onPress={() => setIsCameraOpen(true)} style={styles.spaceBottom}>
        Open Camera
      </Button>
      <View style={[styles.row, styles.spaceBottom]}>
        <Button mode="contained" onPress={() => setIsStartMapOpen(true)} style={[styles.rowItem]}>
          Change pick up
        </Button>
        <View style={styles.rowSpace} />
        <Button mode="contained" onPress={() => setIsEndMapOpen(true)} style={[styles.rowItem]}>
          Change destination
        </Button>
      </View>
      <View style={styles.row}>
        <TextInput
          label="Lowest Temp"
          mode="outlined"
          value={data.start.temp.toString()}
          autoCapitalize="none"
          onChangeText={(newVal: string) => setData({
            ...data,
            start: {
              ...data.start,
              temp: toNum(newVal),
            },
          })}
          style={[styles.spaceBottom, styles.rowItem]}
        />
        <View style={styles.rowSpace} />
        <TextInput
          label="Highest Temp"
          mode="outlined"
          value={data.end.temp.toString()}
          autoCapitalize="none"
          onChangeText={(newVal: string) => setData({
            ...data,
            end: {
              ...data.end,
              temp: toNum(newVal),
            },
          })}
          style={[styles.spaceBottom, styles.rowItem]}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          label="Lowest Humidity"
          mode="outlined"
          value={data.start.humid.toString()}
          autoCapitalize="none"
          onChangeText={(newVal: string) => setData({
            ...data,
            start: {
              ...data.start,
              humid: toNum(newVal),
            },
          })}
          style={[styles.spaceBottom, styles.rowItem]}
        />
        <View style={styles.rowSpace} />
        <TextInput
          label="Highest Humidity"
          mode="outlined"
          value={data.end.humid.toString()}
          autoCapitalize="none"
          onChangeText={(newVal: string) => setData({
            ...data,
            end: {
              ...data.end,
              humid: toNum(newVal),
            },
          })}
          style={[styles.spaceBottom, styles.rowItem]}
        />
      </View>
      {FriendList}
      <View style={styles.row}>
        <Button onPress={onPressSave}>
          Save
        </Button>
        <Button onPress={onPressOrder}>
          Order
        </Button>
      </View>
    </ScrollView>
  );
};

export default Draft;
