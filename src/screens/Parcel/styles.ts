import { StyleSheet, Dimensions } from 'react-native';

const height = (Dimensions.get('screen').height * 3) / 7;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerBack: { },
  headerTitle: {
    paddingVertical: 12,
  },
  headerConnectedStatus: {
    color: '#6fc48f',
  },
  headerDisconnectedStatus: {
    color: '#ff4c4c',
  },
  map: {
    height,
  },
  scrollContainer: {
    paddingHorizontal: 12,
    paddingVertical: 24,
    flex: 1,
    height: '100%',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  full: {
    flex: 1,
  },
  extraSpace: {
    marginLeft: 12,
  },
  spaceBottom: {
    marginBottom: 12,
  },
});

export default styles;
