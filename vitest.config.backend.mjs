import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['backend/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['backend/functions/**/*.mjs'],
      exclude: ['**/*.test.mjs', '**/node_modules/**']
    }
  }
});
