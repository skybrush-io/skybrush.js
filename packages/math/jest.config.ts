import { defineConfig } from 'jest';

export default defineConfig({
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
});
