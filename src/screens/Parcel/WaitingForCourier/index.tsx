import { useCallback, useRef, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import {
  Button, Modal, Portal, Snackbar, Text,
} from 'react-native-paper';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { BarcodeFormat, useScanBarcodes } from 'vision-camera-code-scanner';
import MapView, { Marker } from 'react-native-maps';

import { Parcel, RawParcel } from '../../../types';
import { useAppSelector } from '../../../stores';
import { useUpdateOneMutation, useUpdateProgressMutation } from '../../../services/parcel';
import { buildCameraFormat, emptyId } from '../../../constants';
import styles, { cameraSize } from './styles';
import useCameraPermission from '../hooks/useCameraPermission';
import { useLazyGetOneByNameQuery } from '../../../services/device';

type Props = {
  parcel: Parcel,
  setParcel: React.Dispatch<React.SetStateAction<Parcel>>;
};

type CameraModalProps = {
  hasCameraPermission: boolean;
  isOpen: boolean;
  onHideModal: () => void;
  setData: React.Dispatch<React.SetStateAction<RawParcel>>;
}

const initialError = '';

const CameraModal = ({
  hasCameraPermission, isOpen, onHideModal, setData,
}: CameraModalProps) => {
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices('ultra-wide-angle-camera');

  const [triggerGetDeviceByName, { isLoading }] = useLazyGetOneByNameQuery({});

  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  });

  const onPressTakePicture = async () => {
    try {
      if (barcodes.length < 0) {
        return;
      }

      const latestBarcode = barcodes[barcodes.length];

      if (latestBarcode.rawValue?.includes('/device/name')) {
        const name = latestBarcode.rawValue.replace('/device/name/', '');
        const res = await triggerGetDeviceByName({ name });

        if ('data' in res) {
          setData((prevData) => ({
            ...prevData,
            deviceId: res.data!.id,
          }));
          return;
        }
      }
      throw new Error('Invalid QR Code');
    } catch (e) {
      console.error(e);
    }
  };

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
          format={buildCameraFormat(cameraSize)}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
          photo
        />
        <Button onPress={onPressTakePicture} disabled={isLoading}>
          Take Picture
        </Button>
      </Modal>
    </Portal>
  );
};

const WaitingForCourier = ({ parcel, setParcel }: Props) => {
  const user = useAppSelector((state) => state.auth.user);

  if (parcel.receiver?.id === user?.id || parcel.sender?.id === user?.id) {
    return (
      <View>
        <Text>
          Menunggu kurir
        </Text>
      </View>
    );
  }

  const [data, setData] = useState<RawParcel>({
    id: parcel.id,
    name: parcel.name,
    description: parcel.description,
    photoUri: parcel.photoUri,
    isPhotoValid: parcel.isPhotoValid,
    start: parcel.start!,
    end: parcel.end!,
    senderId: parcel.sender!.id,
    receiverId: parcel.receiver!.id,
    courierId: user!.id,
    deviceId: parcel.device ? parcel.device.id : emptyId,
    status: parcel.status,
  });

  const [isOpenCamera, setIsOpenCamera] = useState(false);

  const [triggerUpdateParcel, { isLoading: isUpdateParcelLoading }] = useUpdateOneMutation({});
  const [
    triggerUpdateProgress, { isLoading: isUpdateProgressLoading },
  ] = useUpdateProgressMutation({});

  const { hasCameraPermission } = useCameraPermission();

  const [error, setError] = useState(initialError);

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
    if (data.courierId === emptyId) {
      setError('Courier cannot be empty');
      return;
    }
    if (data.deviceId === emptyId) {
      setError('Smartbox cannot be empty');
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

  const isLoading = isUpdateParcelLoading || isUpdateProgressLoading;

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
      <CameraModal
        hasCameraPermission={hasCameraPermission}
        isOpen={isOpenCamera}
        onHideModal={() => setIsOpenCamera(false)}
        setData={setData}
      />
      <Text>
        {parcel.name}
      </Text>
      <Text>
        {parcel.description}
      </Text>
      <Image
        source={{ uri: parcel.photoUri }}
        style={styles.image}
      />
      <MapView>
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
      <View style={styles.row}>
        <Button onPress={() => setIsOpenCamera(true)} disabled={isLoading}>
          Scan Smartbox
        </Button>
        <Button onPress={onPressOrder} disabled={data.deviceId === emptyId || isLoading}>
          Order
        </Button>
      </View>
    </ScrollView>
  );
};

export default WaitingForCourier;
