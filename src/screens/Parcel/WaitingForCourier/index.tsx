import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import {
  Banner,
  Button, Modal, Portal, Snackbar,
} from 'react-native-paper';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { BarcodeFormat, useScanBarcodes } from 'vision-camera-code-scanner';
import MapView, { Marker } from 'react-native-maps';

import { Parcel, RawParcel } from '../../../types';
import { useAppSelector } from '../../../stores';
import { useUpdateOneMutation, useUpdateProgressMutation } from '../../../services/parcel';
import { useLazyGetOneQuery } from '../../../services/device';
import { emptyId } from '../../../constants';
import styles from './styles';

import useCameraPermission from '../../../hooks/useCameraPermission';
import useInterval from '../../../hooks/useInterval';
import ParcelInfo from '../components/ParcelInfo';
import useBackCamera from '../../../hooks/useBackCamera';

type Props = {
  parcel: Parcel,
  isLoading: boolean,
  refetch: () => Promise<any>;
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
  const { backDevice } = useBackCamera();

  const [triggerGetDevice, { isLoading }] = useLazyGetOneQuery({});

  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE]);

  const onDismiss = () => {
    if (!isLoading) {
      onHideModal();
    }
  };

  useEffect(() => {
    const scan = async () => {
      try {
        if (barcodes.length < 0) {
          return;
        }

        const latestBarcode = barcodes[barcodes.length - 1];
        if (!latestBarcode) {
          return;
        }

        const hexRegExp = /^[a-f\d]{24}$/i;
        if (hexRegExp.test(latestBarcode.rawValue || '')) {
          const id = latestBarcode.rawValue!;
          const res = await triggerGetDevice({ id });

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

    if (!isLoading && barcodes.length) {
      scan();
    }
  }, [isLoading, barcodes]);

  return (
    <Portal>
      <Modal visible={isOpen} onDismiss={onDismiss}>
        {backDevice !== null ? (
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={backDevice}
            isActive={isOpen && hasCameraPermission}
            // format={buildCameraFormat(cameraSize)}
            enableHighQualityPhotos={false}
            frameProcessor={frameProcessor}
            frameProcessorFps={1}
          />
        ) : null}
      </Modal>
    </Portal>
  );
};

const WaitingForCourier = ({
  parcel,
  isLoading: isGetParcelLoading,
  refetch,
}: Props) => {
  const user = useAppSelector((state) => state.auth.user);

  if (parcel.receiver?.id === user?.id || parcel.sender?.id === user?.id) {
    useInterval({ cb: refetch, delay: 5000 });

    return (
      <ScrollView
        style={styles.container}
        refreshControl={(
          <RefreshControl
            refreshing={isGetParcelLoading}
            onRefresh={() => {
              refetch();
            }}
          />
      )}
      >
        <Banner
          visible
          style={styles.spaceBottom}
        >
          Menunggu kurir
        </Banner>
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
          parcelTravels={[]}
        />
      </ScrollView>
    );
  }

  const [data, setData] = useState<RawParcel>({
    id: parcel.id,
    name: parcel.name,
    description: parcel.description,
    pickUpCoor: parcel.pickUpCoor!,
    arrivedCoor: parcel.arrivedCoor!,
    pickUpPhoto: null,
    arrivedPhoto: null,
    tempThr: parcel.tempThr!,
    hmdThr: parcel.hmdThr!,
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

  const mapRef = useRef<MapView | null>(null);

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
    const res = await triggerUpdateProgress({ id: parcel.id });
    if ('data' in res) {
      refetch();
    }
  }, [onPressSave]);

  const isLoading = isUpdateParcelLoading || isUpdateProgressLoading || isGetParcelLoading;

  useEffect(() => {
    if (data.deviceId !== emptyId) {
      setIsOpenCamera(false);
      onPressOrder();
    }
  }, [data]);

  return (
    <>
      <CameraModal
        hasCameraPermission={hasCameraPermission}
        isOpen={isOpenCamera}
        onHideModal={() => setIsOpenCamera(false)}
        setData={setData}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        stickyHeaderIndices={[0]}
        invertStickyHeaders
        refreshControl={(
          <RefreshControl
            refreshing={isGetParcelLoading}
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
            coordinate={{
              latitude: parcel.pickUpCoor!.lat,
              longitude: parcel.pickUpCoor!.lng,
            }}
          />
          <Marker
            title="Destination"
            coordinate={{
              latitude: parcel.arrivedCoor!.lat,
              longitude: parcel.arrivedCoor!.lng,
            }}
          />
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
          parcelTravels={[]}
        />
      </ScrollView>
      <View style={[styles.footer, styles.row]}>
        <Button
          mode="contained-tonal"
          onPress={() => setIsOpenCamera(true)}
          disabled={isLoading}
          style={styles.rowItem}
        >
          Scan Smartbox
        </Button>
        <View
          style={styles.rowSpace}
        />
        <Button
          mode="contained"
          onPress={onPressOrder}
          disabled={data.deviceId === emptyId || isLoading}
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

export default WaitingForCourier;
