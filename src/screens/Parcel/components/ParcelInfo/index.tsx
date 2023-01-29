import { memo } from 'react';
import { Image, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Parcel, ParcelTravel, Threshold } from '../../../../types';

import styles from './styles';

type Props = Parcel & {
  parcelTravels: ParcelTravel[],
};

const invalidData = -999;

const isDataAccurate = (thr: Threshold, data: number[]) => {
  let inaccurate = 0;
  let validDataLength = 0;
  data.forEach((datum) => {
    if (datum !== invalidData) {
      validDataLength += 1;
      if (!(datum <= thr.high && datum >= thr.low)) {
        inaccurate += 1;
      }
    }
  });

  const invalidPercentage = (inaccurate / validDataLength) * 100;
  return invalidPercentage < 5;
};

const ParcelInfo = ({
  name,
  description,
  sender,
  receiver,
  courier,
  tempThr,
  hmdThr,
  pickUpPhoto,
  arrivedPhoto,
  parcelTravels,
}: Props) => (
  <View>
    <View style={styles.spaceBottom}>
      <View style={styles.spaceBottom}>
        <Text variant="titleSmall">
          Package
        </Text>
        <Text>
          {name}
        </Text>
      </View>
      <Text variant="titleSmall">
        Description
      </Text>
      <Text>
        {description}
      </Text>
    </View>
    {sender ? (
      <View style={styles.spaceBottom}>
        <Text variant="titleSmall">
          Sender Name
        </Text>
        <Text>
          {sender.name}
        </Text>
      </View>
    ) : null}
    {receiver ? (
      <View style={styles.spaceBottom}>
        <Text variant="titleSmall">
          Receiver Name
        </Text>
        <Text>
          {receiver.name}
        </Text>
      </View>
    ) : null}
    {courier ? (
      <View style={styles.spaceBottom}>
        <Text variant="titleSmall">
          Courier Name
        </Text>
        <Text>
          {courier?.name}
        </Text>
      </View>
    ) : null}
    {tempThr && parcelTravels.length ? (
      <View style={[styles.row, styles.rowCenter, styles.spaceBottom]}>
        {isDataAccurate(tempThr, parcelTravels.map((pt) => pt.temp)) ? (
          <>
            <View style={[styles.indicator, styles.green]} />
            <Text>
              Package&apos;s temperature is safe
            </Text>
          </>
        ) : (
          <>
            <View style={[styles.indicator, styles.red]} />
            <Text>
              Package&apos;s temperature is unsafe
            </Text>
          </>
        )}
      </View>
    ) : null}
    {hmdThr && parcelTravels.length ? (
      <View style={[styles.row, styles.rowCenter, styles.spaceBottom]}>
        {isDataAccurate(hmdThr, parcelTravels.map((pt) => pt.temp)) ? (
          <>
            <View style={[styles.indicator, styles.green]} />
            <Text>
              Package&apos;s humidity is safe
            </Text>
          </>
        ) : (
          <>
            <View style={[styles.indicator, styles.red]} />
            <Text>
              Package&apos;s humidity is unsafe
            </Text>
          </>
        )}
      </View>
    ) : null}
    {pickUpPhoto ? (
      <View style={styles.spaceBottom}>
        <Text
          variant="titleMedium"
          style={styles.spaceBottom}
        >
          Pick Up Photo
        </Text>
        <Image
          source={{
            uri: `${pickUpPhoto.uri}?${pickUpPhoto.updatedAt}`,
          }}
          style={styles.image}
        />
      </View>
    ) : null}
    {arrivedPhoto ? (
      <View style={styles.spaceBottom}>
        <Text
          variant="titleMedium"
          style={styles.spaceBottom}
        >
          Arrived Photo
        </Text>
        <Image
          source={{
            uri: `${arrivedPhoto.uri}?${arrivedPhoto.updatedAt}`,
          }}
          style={styles.image}
        />
      </View>
    ) : null}
  </View>
);

export default memo(ParcelInfo);
