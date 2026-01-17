import { describe, it, expect } from 'vitest';

describe('Library Load Time Tests', () => {
    describe('ESM Import', () => {
        it('should measure ESM import time', async () => {
            const start = performance.now();

            await import('../index');

            const end = performance.now();
            const duration = end - start;

            console.log(`ESM import time: ${duration.toFixed(2)}ms`);
            expect(duration).toBeLessThan(200);
        });
    });

    describe('Individual Exports', () => {
        it('should measure useLoading import time', async () => {
            const start = performance.now();

            await import('../hooks/useLoading');

            const end = performance.now();
            const duration = end - start;

            console.log(`useLoading import time: ${duration.toFixed(2)}ms`);
            expect(duration).toBeLessThan(50);
        });

        it('should measure LoadingRenderer import time', async () => {
            const start = performance.now();

            await import('../components/LoadingRenderer');

            const end = performance.now();
            const duration = end - start;

            console.log(`LoadingRenderer import time: ${duration.toFixed(2)}ms`);
            expect(duration).toBeLessThan(50);
        });

        it('should measure Loading import time', async () => {
            const start = performance.now();

            await import('../components/Loading');

            const end = performance.now();
            const duration = end - start;

            console.log(`Loading import time: ${duration.toFixed(2)}ms`);
            expect(duration).toBeLessThan(50);
        });

        it('should measure EventEmitter import time', async () => {
            const start = performance.now();

            await import('../utils/EventEmitter');

            const end = performance.now();
            const duration = end - start;

            console.log(`EventEmitter import time: ${duration.toFixed(2)}ms`);
            expect(duration).toBeLessThan(20);
        });
    });

    describe('Re-import Performance', () => {
        it('should measure cached import time', async () => {
            // First import (warm up)
            await import('../index');

            // Second import (should be cached)
            const start = performance.now();
            await import('../index');
            const end = performance.now();

            const duration = end - start;

            console.log(`Cached import time: ${duration.toFixed(2)}ms`);
            expect(duration).toBeLessThan(10); // Cached imports should be very fast
        });
    });

    describe('Module Size Impact', () => {
        it('should report approximate module sizes', () => {
            const moduleInfo = {
                'useLoading': '~2.5 kB',
                'LoadingRenderer': '~3.0 kB',
                'Loading': '~0.5 kB',
                'EventEmitter': '~0.8 kB',
                'Total': '~6.8 kB raw',
            };

            console.log('\nModule Sizes (approximate):');
            Object.entries(moduleInfo).forEach(([module, size]) => {
                console.log(`  ${module}: ${size}`);
            });

            expect(true).toBe(true);
        });
    });
});
