import identity from 'lodash-es/identity';
import produce from 'immer';

/**
 * Resolves an array containing a mix of action types and action creators to
 * action types only.
 */
export const resolveActionTypes = (actionTypes) =>
  actionTypes
    .filter(Boolean)
    .map((action) =>
      typeof action === 'function' && typeof action.type === 'string'
        ? action.type
        : action
    );

/**
 * Creates an "action scrubber" function that replaces the payload of an action
 * with a placeholder if the type of the action matches one of the input
 * action types or action creators.
 */
export function createActionScrubber(actionTypes) {
  if (!Array.isArray(actionTypes)) {
    actionTypes = [actionTypes];
  }

  actionTypes = resolveActionTypes(actionTypes);
  return actionTypes.length > 0
    ? produce((action) => {
        if (actionTypes.includes(action.type)) {
          action.payload = '<<JSON_DATA>>';
        }
      })
    : identity;
}
