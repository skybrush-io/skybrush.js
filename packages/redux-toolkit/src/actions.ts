import identity from 'lodash-es/identity';
import { Action, ActionCreator } from '@reduxjs/toolkit';

/**
 * Resolves an array containing a mix of action types and action creators to
 * action types only.
 */
export function resolveActionTypes<A>(
  actionTypes: Array<ActionCreator<A> | A>
): A[] {
  return actionTypes
    .filter(Boolean)
    .map((action) =>
      typeof action === 'function' &&
      Object.prototype.hasOwnProperty.call(action, 'type')
        ? ((action as any).type as A)
        : (action as any as A)
    );
}

/**
 * Creates an "action scrubber" function that replaces the payload of an action
 * with a placeholder if the type of the action matches one of the input
 * action types or action creators.
 */
export function createActionScrubber<A extends string>(
  actionTypes: A | ActionCreator<A> | Array<A | ActionCreator<A>>
): (action: Action<A>) => Action<A> {
  if (!Array.isArray(actionTypes)) {
    actionTypes = [actionTypes];
  }

  const resolvedActionTypes = resolveActionTypes(actionTypes);
  return resolvedActionTypes.length > 0
    ? (action: Action<A>) => {
        if (resolvedActionTypes.includes(action.type) && 'payload' in action) {
          return {
            ...action,
            payload: '<<JSON_DATA>>',
          };
        }

        return action;
      }
    : identity;
}
