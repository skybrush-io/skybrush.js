import { take } from 'redux-saga/effects';

import { sendMessage } from './slice';

function* outputSaga() {
  while (true) {
    const action = yield take(sendMessage);

    // TODO(ntamas): handle setColor, setFlightMode, disarm
    console.log(action);
  }
}

export default outputSaga;
