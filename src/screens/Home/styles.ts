import { StyleSheet } from 'react-native';

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
  headerTitle: {
    paddingVertical: 12,
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 24,
    flexGrow: 1,
  },
  parcelCard: {
    backgroundColor: '#e2e8f0',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  parcelStatus: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  textCenter: {
    textAlign: 'center',
  },
  spaceBottom: {
    marginBottom: 12,
  },
});

export default styles;
