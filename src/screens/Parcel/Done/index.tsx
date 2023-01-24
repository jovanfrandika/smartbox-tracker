import { View, Image } from 'react-native';
import { Text } from 'react-native-paper';

import { Parcel } from '../../../types';

type Props = {
  parcel: Parcel,
};

const Done = (props: Props) => {
  const { parcel } = props;

  return (
    <View>
      <Text>{parcel.name}</Text>
      <Text>{parcel.description}</Text>
      <Image source={{ uri: parcel.photoUri }} />
    </View>
  );
};

export default Done;
