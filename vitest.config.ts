import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['test/setup.ts'],
    coverage: {
      provider: 'v8',
      enabled: true,
      exclude: ['src/wrapper/**/*.ts'],
      reporter: ['text', 'html', 'lcov'],
    }
  },
})
