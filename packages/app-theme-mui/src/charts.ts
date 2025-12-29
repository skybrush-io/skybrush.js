import type { ChartOptions, ChartType } from 'chart.js';
import createColor from 'color';
import { defaultFont } from './fonts.js';

/**
 * Creates a standard style for a single bar chart data series in a Chart.js
 * chart.
 */
export function createBarChartDataSeriesStyle({
  canvas,
  color,
}: {
  canvas: HTMLCanvasElement;
  color: string;
}) {
  return {
    backgroundColor: createGradientBackground({ canvas, color }),
    borderColor: color,
    borderWidth: 2,
  };
}

type CreateGradientBackgroundOptions = {
  alpha?: number;
  canvas: HTMLCanvasElement;
  color: string | string[];
  height?: number;
  reverse?: boolean;
};

/**
 * Creates a gradient fill that could be used in a Chart.js background in a bar or
 * line chart.
 *
 * @param  alpha   the alpha component of the color
 * @param  color   the color; you may use an array here if you need multiple gradients
 * @param  canvas  the canvas on which the gradient will be drawn
 * @param  height  the height of the gradient
 * @param  reverse whether the gradient should go from top to bottom
 *         (false) or bottom to top (true)
 * @return the constructed gradient fill
 */
export function createGradientBackground(
  options: CreateGradientBackgroundOptions & { color: string[] }
): CanvasGradient[];
export function createGradientBackground(
  options: CreateGradientBackgroundOptions & { color: string }
): CanvasGradient;
export function createGradientBackground({
  alpha = 0.8,
  color,
  canvas,
  height = 170,
  reverse = false,
}: CreateGradientBackgroundOptions): any {
  if (Array.isArray(color)) {
    return color.map((c) =>
      createGradientBackground({ alpha, canvas, color: c, height, reverse })
    );
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2D canvas context');
  }

  const gradientFill = ctx.createLinearGradient(0, height, 0, 50);
  gradientFill.addColorStop(
    0,
    createColor(color)
      .alpha(reverse ? alpha : 0)
      .string()
  );
  gradientFill.addColorStop(
    1,
    createColor(color)
      .alpha(reverse ? 0 : alpha)
      .string()
  );
  return gradientFill;
}

type CreateChartStyleOptions = {
  animate?: boolean;
  dark?: boolean;
  legend?: boolean;
  rotateTickLabels?: boolean;
  showPoints?: boolean;
  smoothing?: boolean;
};

/**
 * Creates a generic chart style that fits the style of the application.
 *
 * @param  dark       whether the chart appears on a dark background
 * @param  legend     whether the chart should have a legend
 * @param  rotateTickLabels  whether to rotate the tick labels on the axes if needed
 * @param  showPoints whether the chart should show the individual data points
 * @param  smoothing  whether the lines on the charts should be smoothed
 * @return {object}  an options object that can be passed directly to a Chart.js
 *         React component
 */
export function createChartStyle<T extends ChartType = ChartType>({
  animate = true,
  dark,
  legend = true,
  rotateTickLabels = false,
  smoothing,
  showPoints = true,
}: CreateChartStyleOptions = {}): ChartOptions<T> {
  const fontColor = dark ? 'rgba(255, 255, 255, 0.54)' : 'rgba(0, 0, 0, 0.54)';
  const fontFamily = defaultFont;
  const fontSize = 14;

  const result: any = {
    elements: {},
    legend: {
      display: legend,
      labels: {
        fontColor,
        fontFamily,
        fontSize,
      },
    },

    scales: {
      xAxes: [
        {
          id: 'bottom',
          gridLines: {
            color: dark ? 'rgba(255, 255, 255, 0.17)' : 'rgba(0, 0, 0, 0.17)',
            zeroLineColor: dark
              ? 'rgba(255, 255, 255, 0.34)'
              : 'rgba(0, 0, 0, 0.34)',
          },
          ticks: {
            fontColor,
            fontFamily,
            fontSize,
          },
        },
      ],

      yAxes: [
        {
          id: 'left',
          gridLines: {
            color: dark ? 'rgba(255, 255, 255, 0.17)' : 'rgba(0, 0, 0, 0.17)',
            zeroLineColor: dark
              ? 'rgba(255, 255, 255, 0.34)'
              : 'rgba(0, 0, 0, 0.34)',
          },
          ticks: {
            fontColor,
            fontFamily,
            fontSize,
          },
        },
      ],
    },

    maintainAspectRatio: false,

    tooltips: {
      titleFontFamily: defaultFont,
      bodyFontFamily: defaultFont,
      footerFontFamily: defaultFont,
    },
  };

  if (!animate) {
    result.animation = {
      duration: 0,
    };
    result.transitions = {
      active: { animation: { duration: 0 } },
      resize: { animation: { duration: 0 } },
    };
  }

  if (!rotateTickLabels) {
    Object.assign(result.scales.xAxes[0].ticks, {
      maxRotation: 0,
      minRotation: 0,
    });
  }

  if (!showPoints) {
    result.elements.point = {
      radius: 0,
    };
  }

  if (!smoothing) {
    result.elements.line = {
      tension: 0,
    };
  }

  return result as ChartOptions<T>;
}
