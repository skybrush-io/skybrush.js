import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';

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
    <ThemeProvider>
      <PersistGate persistor={persistor}>
        <CssBaseline />
        <AppHotkeys>
          <TopLevelView />
        </AppHotkeys>
        <DialogsContainer />
        <PendingUAVIdOverlay />
      </PersistGate>
    </ThemeProvider>
  </StoreProvider>
);

export default App;
