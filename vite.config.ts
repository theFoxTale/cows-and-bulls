import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/cows-and-bulls/',
  resolve: {
    alias: {
      '@core': new URL('src/core', import.meta.url).pathname,
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
