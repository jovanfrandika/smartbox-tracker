import { MD3LightTheme as DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
      <Screens />
    </SafeAreaProvider>
  </PaperProvider>
);

export default App;
