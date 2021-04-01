import { useEffect, useRef } from 'react';

const useScrollChildIntoView = (childIndex) => {
  const ref = useRef();
  useEffect(() => {
    if (ref && ref.current) {
      const childNode = ref.current.childNodes[childIndex];
      if (childNode) {
        childNode.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    }
  }, [childIndex]);
  return ref;
};

export default useScrollChildIntoView;
