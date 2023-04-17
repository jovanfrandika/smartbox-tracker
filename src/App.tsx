import { MD3LightTheme as DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';

import { stores, persistor } from './stores';

import Screens from './screens';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato',
    secondary: 'yellow',
  },
};

const App = () => (
  <PaperProvider theme={theme}>
    <SafeAreaProvider>
      <Provider store={stores}>
        <PersistGate persistor={persistor}>
          <Screens />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  </PaperProvider>
);

export default App;
