import { useRef } from 'react';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { Button, Modal, Portal } from 'react-native-paper';
import { Platform } from 'react-native';

import { useCheckPhotoMutation, useGetPhotoSignedUrlMutation } from '../../../../services/parcel';
import { usePutPhotoMutation } from '../../../../services/gcp';
import styles, { cameraSize } from './styles';
import { ParcelStatusEnum, RawParcel } from '../../../../types';

type Props = {
  parcelId: string;
  status: ParcelStatusEnum.PickUp | ParcelStatusEnum.Arrived;
  hasCameraPermission: boolean;
  isOpen: boolean;
  onHideModal: () => void;
  setData: React.Dispatch<React.SetStateAction<RawParcel>>;
}

const CameraModal = ({
  parcelId,
  status,
  hasCameraPermission,
  isOpen,
  onHideModal,
  setData,
}: Props) => {
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices('wide-angle-camera');

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
      res = await triggerGetPhotoSignedUrl({ id: parcelId, status });
      if ('error' in res) {
        throw new Error(res.error);
      }

      const photoPath = Platform.OS === 'ios' ? photo!.path : `file://${photo!.path}`;
      res = await triggerPutPhoto({ url: res.data!.url, photoPath });

      res = await triggerCheckPhoto({ id: parcelId, status });

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
          style={[styles.camera, styles.spaceBottom]}
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
        <Button
          mode="contained-tonal"
          onPress={onPressTakePicture}
          disabled={isLoading}
          style={styles.spaceBottom}
        >
          Take Picture
        </Button>
      </Modal>
    </Portal>
  );
};

export default CameraModal;
