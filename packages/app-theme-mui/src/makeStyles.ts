// This module is a simple, drop-in replacement for the makeStyles() function
// that was removed in MUI v7.

import { css } from '@emotion/css';
import { type CSSObject } from '@emotion/css/create-instance';
import { type Theme, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';

type StylesElementRecord = Record<string, CSSObject>;

const makeStyles =
  <STE extends StylesElementRecord>(
    stylesElement: STE | ((theme: Theme) => STE)
  ): (() => { [K in keyof STE]: string }) =>
  () => {
    const theme = useTheme();
    return useMemo(() => {
      const rawClasses =
        typeof stylesElement === 'function'
          ? stylesElement(theme)
          : stylesElement;

      const result = {} as { [K in keyof STE]: string };
      Object.entries(rawClasses).forEach(([key, value = {}]) => {
        const generatedCSS = css(value);
        result[key as keyof STE] = generatedCSS;
      });

      return result;
    }, [stylesElement, theme]);
  };

export default makeStyles;
