import { useEffect } from 'react';

/**
 * React hook that applies the given CSS rules (as a string) if and only if a
 * given condition holds.
 */
const useConditionalCSS = (css, condition) => {
  useEffect(() => {
    if (condition) {
      const style = document.createElement('style');
      const head = document.head || document.querySelectorAll('head')[0];

      style.type = 'text/css';
      style.append(document.createTextNode(css));
      head.append(style);

      return () => style.remove();
    }
  }, [css, condition]);
};

export default useConditionalCSS;
