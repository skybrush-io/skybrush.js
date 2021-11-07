import React from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';

import CssBaseline from '@mui/material/CssBaseline';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';

import PreventDisplaySleep from './components/PreventDisplaySleep';
import DialogsContainer from './dialogs';
import AppHotkeys from './hotkeys';
import { persistor, store } from './store';
import ThemeProvider from './theme';
import PendingUAVIdOverlay from './views/PendingUAVIdOverlay';
import TopLevelView from './views/TopLevelView';

// eslint-disable-next-line import/no-unassigned-import
import 'typeface-fira-sans';

import '../assets/css/kbd.css';
import '../assets/css/screen.less';
import '../assets/css/split-pane.less';
import '../assets/css/tooltips.less';

const App = () => (
  <StoreProvider store={store}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider>
        <PersistGate persistor={persistor}>
          <CssBaseline />
          <AppHotkeys>
            <TopLevelView />
          </AppHotkeys>
          <DialogsContainer />
          <PendingUAVIdOverlay />
          <PreventDisplaySleep />
        </PersistGate>
      </ThemeProvider>
    </StyledEngineProvider>
  </StoreProvider>
);

export default App;
