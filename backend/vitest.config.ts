import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
        globals: true,
        setupFiles: ['./src/__mocks__/setup.ts']
    },
});
