import React from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';

import CssBaseline from '@mui/material/CssBaseline';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';

import { InputManager } from './features/inputs/components';
import { RCOutputManager } from './features/rc/components';
import { persistor, store } from './store';
import ThemeProvider from './theme';
import TopLevelView from './views';

/* eslint-disable import/no-unassigned-import */
require('typeface-fira-sans');
/* eslint-enable import/no-unassigned-import */

const App = () => (
  <StoreProvider store={store}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider>
        <PersistGate persistor={persistor}>
          <CssBaseline />
          <TopLevelView />
          <InputManager />
          <RCOutputManager />
        </PersistGate>
      </ThemeProvider>
    </StyledEngineProvider>
  </StoreProvider>
);

export default App;
