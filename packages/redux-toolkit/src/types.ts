import type { Action, Dispatch, UnknownAction } from '@reduxjs/toolkit';

export type SelectionHandlerThunk<
  T = string,
  S = unknown,
  A extends Action = UnknownAction,
  D extends Dispatch<UnknownAction> = Dispatch<A>,
> = (
  id: T,
  event: Event | React.SyntheticEvent
) => (dispatch: D, getState: () => S) => void;

export type SelectionHandlerReduxFunctions<
  T = string,
  S = unknown,
  A = UnknownAction,
> = {
  activateItem?: (item: T) => A | undefined | void;
  getSelection: (state: S) => T[];
  setSelection?: (value: T[]) => A | undefined | void;
  getListItems?: (state: S) => T[];
};
