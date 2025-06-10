import type { UnknownAction } from '@reduxjs/toolkit';

export type SelectionHandlerReduxFunctions<
  T = string,
  S = unknown,
  A = UnknownAction
> = {
  activateItem?: (item: T) => A | undefined | void;
  getSelection: (state: S) => T[];
  setSelection?: (value: T[]) => A | undefined | void;
  getListItems?: (state: S) => T[];
};
