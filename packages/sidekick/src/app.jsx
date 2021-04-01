import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import { HotKeys } from 'react-hotkeys';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';

import DialogsContainer from './dialogs';
import keyMap from './keymap';
import { persistor, store } from './store';
import ThemeProvider from './theme';
import TopLevelView from './views/TopLevelView';

import 'typeface-fira-sans';

import '../assets/css/screen.less';
import '../assets/css/split-pane.less';
import '../assets/css/tooltips.less';

const App = () => (
  <StoreProvider store={store}>
    <ThemeProvider>
      <PersistGate persistor={persistor}>
        <CssBaseline />
        <HotKeys root keyMap={keyMap}>
          <TopLevelView />
        </HotKeys>
        <DialogsContainer />
      </PersistGate>
    </ThemeProvider>
  </StoreProvider>
);

export default App;
