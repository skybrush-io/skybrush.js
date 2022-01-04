import { keyframes } from '@mui/styled-engine';

export const fade = keyframes`
from {
  opacity: 0;
}

to {
  opacity: 1;
}
`;

const flashWithOpacity = (opacity: number) => keyframes`
  from, 49% {
    opacity: ${opacity};
  }

  50%, to {
    opacity: 1;
  }
`;

export const flash = flashWithOpacity(0.2);
export const dimFlash = flashWithOpacity(0.5);

export const ripple = keyframes`
from {
  transform: scale(0.8);
  opacity: 1;
}

to {
  transform: scale(2.4);
  opacity: 0;
}
`;
