/**
 * Requiring all modules that we need in order to make AFrame work.
 */

// Yes, this is correct. AFrame has a default export, at least in version 1.7 and
// later. The typings provided by @types/aframe are incorrect (probably refer to an
// older AFrame version) so we patch them.
import AFrame from 'aframe';

export const { THREE } = AFrame;

export default AFrame;
