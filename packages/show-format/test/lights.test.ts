import test, { ExecutionContext } from 'ava';

import {
  createLightProgramPlayer,
  LightProgram,
  LightProgramLike,
  Color,
} from '../src';
import { shuffle } from '../src/utils';

const lightProgram: LightProgram = {
  version: 1,
  data: 'DAIE/wD/BQkzFgJJDQT/AP8FCTMWAqEHCACA/zICgA8EAP//AAj/gADIAQj//wDIAQgA///IAQj/AADIAQJKCOcPGC8HBwTkEhsACN0WIg0HAgTcFyMACNMdLBIHAgTRHi4ACL4qQScHAQS9K0IACLUwShEHBASzMkwACJRGazwHAwSSR20ACI5JcQgHBwSLTHQACH5UgRkHAQR9VIIACF9ooDwHFARUb6sACD99wCoHDAQ5gcYACDWEygkHAwQzhcwACACm/2QCmBkMAwT//wAFCACm/wUCDw0E//8ABQlMBQKMAQqWAQA=',
};

const expectedColors: Record<number, Color> = {
  0: [1, 0, 1],
  0.54: [0.2, 0.2, 0.2],
  2: [1, 0, 1],
  2.54: [0.2, 0.2, 0.2],
  4: [1, 0, 1],
  4.54: [0.2, 0.2, 0.2],
  10: [0.2, 0.2, 0.2],
  23.12: [0.2, 0.2, 0.2],
  23.62: [0.1, 0.35, 0.6],
  24.12: [0, 0.5, 1.0],
  40: [0, 0.5, 1.0],
  62.52: [0, 1, 1],
  64.52: [0.5, 0.75, 0.5],
  66.52: [1, 0.5, 0],
  67.32: [1, 0.6, 0],
  68.12: [1, 0.7, 0],
  68.92: [1, 0.8, 0],
  69.72: [1, 0.9, 0],
  70.52: [1, 1, 0],
  71.52: [0.75, 1, 0.25],
  72.52: [0.5, 1, 0.5],
  73.52: [0.25, 1, 0.75],
  74.52: [0, 1, 1],
  /* ... */
  156.16: [0.44, 0.44, 0.24],
  156.18: [0.3, 0.3, 0.3],
  160.7: [0.125, 0.125, 0.125],
  161.98: [0, 0, 0],
};

const createColorEvaluator = (program: LightProgramLike) => {
  const { evaluateColorAt } = createLightProgramPlayer(program);
  return (t: number): Color => {
    const color: Color = [0, 0, 0];
    evaluateColorAt(t, color);
    return color;
  };
};

const almostEquals =
  (t: ExecutionContext) =>
  (value: Color, expected: Color, eps = 1e-2) => {
    const message = `Colors do not match, expected [${String(
      expected
    )}], got [${String(value)}]`;
    t.assert(Math.abs(value[0] - expected[0]) < eps, message);
    t.assert(Math.abs(value[1] - expected[1]) < eps, message);
    t.assert(Math.abs(value[2] - expected[2]) < eps, message);
  };

test('empty light program evaluation', (t) => {
  const ev = createColorEvaluator(new Uint8Array());
  const eq = almostEquals(t);
  const BLACK: Color = [0, 0, 0];

  eq(ev(0), BLACK);
  eq(ev(10), BLACK);
  eq(ev(3.5), BLACK);
  eq(ev(42), BLACK);
  eq(ev(Number.NEGATIVE_INFINITY), BLACK);
});

test('NOP-only light program evaluation', (t) => {
  const ev = createColorEvaluator(Uint8Array.from([1, 1, 1, 1, 1, 1, 1, 1]));
  const eq = almostEquals(t);
  const BLACK: Color = [0, 0, 0];

  eq(ev(0), BLACK);
  eq(ev(10), BLACK);
  eq(ev(3.5), BLACK);
  eq(ev(42), BLACK);
  eq(ev(Number.NEGATIVE_INFINITY), BLACK);
});

test('undefined light program evaluation', (t) => {
  const ev = createColorEvaluator(undefined);
  const eq = almostEquals(t);
  const WHITE: Color = [1, 1, 1];

  eq(ev(0), WHITE);
  eq(ev(10), WHITE);
  eq(ev(3.5), WHITE);
  eq(ev(42), WHITE);
  eq(ev(Number.NEGATIVE_INFINITY), WHITE);
});

test('light program evaluator creation from string', (t) => {
  const ev = createColorEvaluator(lightProgram.data);
  const eq = almostEquals(t);

  const ts = [10, 40, 70.52];
  for (const t of ts) {
    eq(ev(t), expectedColors[t]);
  }
});

test('light program evaluation', (t) => {
  const ev = createColorEvaluator(lightProgram);
  const eq = almostEquals(t);

  const ts = Object.keys(expectedColors).map((x) => Number(x));
  for (const t of ts) {
    eq(ev(t), expectedColors[t]);
  }

  eq(ev(Number.NEGATIVE_INFINITY), expectedColors[ts[0]]);
});

test('light program evaluation, shuffled', (t) => {
  const ev = createColorEvaluator(lightProgram);
  const eq = almostEquals(t);

  const ts = Object.keys(expectedColors).map((x) => Number(x));

  for (let i = 0; i < 5; i++) {
    shuffle(ts);
    for (const t of ts) {
      eq(ev(t), expectedColors[t]);
    }
  }
});

test('light program with WAIT_UNTIL opcode', (t) => {
  /* light program: 
  
  wait until T=4
  set gray 50%
  wait 4 seconds
  wait until T=10
  set black
  wait 2 seconds
  wait until T=1 (immediate)
  set white
  wait 2 seconds
  */
  const ev = createColorEvaluator(
    Uint8Array.from([
      3, 0xc8, 0x01, 5, 0x80, 0xc8, 0x01, 3, 0xf4, 0x03, 6, 0x64, 3, 0x32, 7,
      0x64, 0,
    ])
  );
  const eq = almostEquals(t);
  const BLACK: Color = [0, 0, 0];
  const GRAY: Color = [0.5, 0.5, 0.5];
  const WHITE: Color = [1, 1, 1];

  eq(ev(0), BLACK);
  eq(ev(1), BLACK);
  eq(ev(2), BLACK);
  eq(ev(3), BLACK);
  eq(ev(4), GRAY);
  eq(ev(5), GRAY);
  eq(ev(6), GRAY);
  eq(ev(7), GRAY);
  eq(ev(8), GRAY);
  eq(ev(9), GRAY);
  eq(ev(10), BLACK);
  eq(ev(11), BLACK);
  eq(ev(12), WHITE);
});

test('light program with invalid command sequences', (t) => {
  t.throws(
    () => {
      const ev = createColorEvaluator(Uint8Array.from([191]));
      ev(2);
    },
    {
      message: /Unknown command/,
    }
  );
  t.throws(
    () => {
      const ev = createColorEvaluator(Uint8Array.from([13]));
      ev(2);
    },
    {
      message: /Found end loop command/,
    }
  );
  t.throws(
    () => createColorEvaluator({ version: 66, data: '' } as LightProgram),
    { message: /version/ }
  );
  t.throws(
    () => {
      const ev = createColorEvaluator(Uint8Array.from([3, 0xff, 0xff, 0xff]));
      ev(2);
    },
    {
      message: /Bytecode ended/,
    }
  );
});

test('light program iteration', (t) => {
  const ev = createColorEvaluator(lightProgram);
  const eq = almostEquals(t);
  const player = createLightProgramPlayer(lightProgram);
  let nextTimestamp = 0;

  for (const [timestamp, color] of player.iterate(4)) {
    t.assert(nextTimestamp === timestamp);
    eq(color, ev(timestamp));
    nextTimestamp += 0.25;
  }
});

test('light program evaluation, invalid input type', (t) => {
  t.throws(() => createColorEvaluator((() => {}) as any));
});
