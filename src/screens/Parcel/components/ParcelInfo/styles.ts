import { StyleSheet, Dimensions } from 'react-native';

const mapHeight = Dimensions.get('screen').height / 2;
export const cameraSize = 420;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 24,
    flexGrow: 1,
  },
  textCenter: {
    textAlign: 'center',
  },
  mapContainer: {
  },
  map: {
    height: mapHeight,
  },
  camera: {
    height: cameraSize,
  },
  image: {
    width: Dimensions.get('screen').width - 24,
    height: cameraSize,
  },
  rowCenter: {
    alignItems: 'center',
  },
  indicator: {
    height: 24,
    width: 24,
    borderRadius: 24,
    marginRight: 12,
  },
  red: {
    backgroundColor: '#f43f5e',
  },
  green: {
    backgroundColor: '#22c55e',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  rowItem: {
    flex: 1,
  },
  rowSpace: {
    marginLeft: 5,
  },
  spaceBottom: {
    marginBottom: 12,
  },
});

export default styles;
