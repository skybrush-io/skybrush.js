import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';

import { RCOutputManager } from './features/rc/components';
import { persistor, store } from './store';
import ThemeProvider from './theme';
import TopLevelView from './views';

// eslint-disable-next-line import/no-unassigned-import
require('typeface-fira-sans');

const App = () => (
  <StoreProvider store={store}>
    <ThemeProvider>
      <PersistGate persistor={persistor}>
        <CssBaseline />
        <TopLevelView />
        <RCOutputManager />
      </PersistGate>
    </ThemeProvider>
  </StoreProvider>
);

export default App;
