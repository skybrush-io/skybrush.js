import { TextField } from 'mui-rff';
import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';
import { Form } from 'react-final-form';
import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import ConnectionStatusIndicator from '~/components/ConnectionStatusIndicator';
import { toggleServerConnection } from '~/features/input/actions';
import {
  getServerConnectionState,
  isServerConnectionActive,
} from '~/features/input/selectors';
import { getInitialValuesForServerConnectionForm } from '~/features/settings/selectors';
import { setServerConnectionSettings } from '~/features/settings/slice';

const ServerConnectionStatusIndicator = connect(
  // mapStateToProps
  (state) => ({
    status: getServerConnectionState(state),
  }),
  // mapDispatchToProps
  {}
)(ConnectionStatusIndicator);

const validate = (values) => {
  const result = {};

  if (typeof values.host !== 'string' || values.host.length === 0) {
    result.host = 'Hostname must not be empty';
  }

  const port = Number.parseInt(values.port, 10);
  if (
    typeof port !== 'number' ||
    !Number.isFinite(port) ||
    port <= 0 ||
    port > 65535
  ) {
    result.port = 'Invalid port number';
  }

  return result;
};

const ServerTab = ({
  connectionActive,
  initialValues,
  onSaveServerSettings,
  onToggleServerConnection,
}) => {
  const formRef = useRef();

  const onConnect = useCallback(() => {
    if (!connectionActive && formRef && formRef.current) {
      formRef.current.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    }

    if (onToggleServerConnection) {
      onToggleServerConnection();
    }
  }, [connectionActive, onToggleServerConnection]);

  return (
    <Box>
      <Form
        initialValues={initialValues}
        validate={validate}
        onSubmit={onSaveServerSettings}
      >
        {({ handleSubmit, dirty, invalid }) => (
          <form
            ref={formRef}
            id='server-connection-form'
            onSubmit={handleSubmit}
          >
            <Box pt={1} display='flex' flexDirection='row'>
              <Box flex={1}>
                <TextField
                  fullWidth
                  name='host'
                  label='Hostname'
                  variant='filled'
                />
              </Box>
              <Box px={0.5} />
              <Box>
                <TextField
                  name='port'
                  label='Port'
                  variant='filled'
                  type='number'
                  min={1}
                  max={65535}
                />
              </Box>
            </Box>

            <Box py={1}>
              <Typography variant='caption' color='textSecondary'>
                Note that Sidekick needs to connect to the server on a port that
                is different from the primary port of the server; typically it
                is higher by two. E.g., if the server is listening on port 5000,
                Sidekick needs to connect on port 5002.
              </Typography>
            </Box>

            <Box display='flex' flexDirection='row' alignItems='center' pt={1}>
              <ServerConnectionStatusIndicator />
              <Box flex={1} />
              <Button disabled={invalid} onClick={onConnect}>
                {connectionActive ? 'Disconnect' : 'Connect'}
              </Button>
              <Button disabled={!dirty || invalid} onClick={handleSubmit}>
                Save
              </Button>
            </Box>
          </form>
        )}
      </Form>
    </Box>
  );
};

ServerTab.propTypes = {
  connectionActive: PropTypes.bool,
  initialValues: PropTypes.shape({
    host: PropTypes.string,
    port: PropTypes.number,
  }),
  onSaveServerSettings: PropTypes.func,
  onToggleServerConnection: PropTypes.func,
};

export default connect(
  // mapStateToProps
  (state) => ({
    connectionActive: isServerConnectionActive(state),
    initialValues: getInitialValuesForServerConnectionForm(state),
  }),
  // mapDispatchToProps
  {
    onSaveServerSettings: (values) => (dispatch) => {
      dispatch(setServerConnectionSettings(values));
    },

    onToggleServerConnection: toggleServerConnection,
  }
)(ServerTab);
