import * as React from 'react';
import useAsyncEffect from 'use-async-effect';

let warned = false;

interface WindowWithBridge {
  preventDisplaySleep: () => unknown;
  restoreDisplaySleep: (token: unknown) => void;
}

const PreventDisplaySleepHelper = () => {
  useAsyncEffect(
    () => {
      const bridge = (window as any)?.bridge as
        | WindowWithBridge
        | null
        | undefined;
      if (bridge?.preventDisplaySleep) {
        return bridge.preventDisplaySleep();
      }

      if (!warned) {
        console.warn(
          'window.bridge.preventDisplaySleep() is not available; cannot prevent sleeping'
        );
        warned = true;
      }
    },
    (token) => {
      if (token !== undefined && token !== null) {
        const bridge = (window as any)?.bridge as
          | WindowWithBridge
          | null
          | undefined;
        bridge!.restoreDisplaySleep(token);
      }
    },
    []
  );

  return null;
};

export interface PreventDisplaySleepProps {
  active?: boolean;
}

const PreventDisplaySleep = ({ active = true }: PreventDisplaySleepProps) =>
  active ? <PreventDisplaySleepHelper /> : null;

export default PreventDisplaySleep;
