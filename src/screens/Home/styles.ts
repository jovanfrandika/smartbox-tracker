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
    flex: 1,
    justifyContent: 'space-between',
  },
  textCenter: {
    textAlign: 'center',
  },
  spaceBottom: {
    marginBottom: 12,
  },
});

export default styles;
