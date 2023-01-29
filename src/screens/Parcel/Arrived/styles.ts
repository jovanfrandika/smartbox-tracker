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
  mapCircle: {
    opacity: 0.25,
  },
  camera: {
    height: cameraSize,
  },
  image: {
    width: Dimensions.get('screen').width - 24,
    height: cameraSize,
  },
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 24,
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
