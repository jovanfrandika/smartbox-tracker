import {
  useState, useRef, useMemo, useCallback,
} from 'react';
import {
  Button, TextInput, Snackbar, Text, Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import type { RouteProp } from '@react-navigation/native';
import {
  RootStackParamList,
} from '../../types';

import { useAppDispatch } from '../../stores';

import styles from './styles';

type ParcelScreenRouteProp = RouteProp<RootStackParamList, 'Parcel'>;

const initialError = '';

const Device = () => {
  const navigation = useNavigation();
  const route = useRoute<ParcelScreenRouteProp>();

  const dispatch = useAppDispatch();

  const [error, setError] = useState<string>(initialError);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Button
          onPress={navigation.goBack}
          style={styles.headerBack}
        >
          Back
        </Button>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Smartbox
          {' '}
        </Text>
      </View>
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(initialError)}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
};

export default Device;
