/**
 * Helper function to convert a JavaScript object into a string that can be
 * used as an attribute value for an A-Frame entity.
 */
export function objectToString(object) {
  return Object.entries(object)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}

/**
 * Customization of shouldCaptureKeyEvent() from A-Frame to allow other common
 * scenarios (e.g., allowing key events when the focused element is not editable).
 */
export function shouldCaptureKeyEvent(event, condition = 'legacy') {
  switch (condition) {
    case 'always':
      return true;

    case 'legacy':
      return !event.metaKey && document.activeElement === document.body;

    case 'notEditable':
      return (
        !event.metaKey &&
        (!document.activeElement ||
          document.activeElement === document.body ||
          !document.activeElement.isContentEditable)
      );

    default:
      return false;
  }
}
