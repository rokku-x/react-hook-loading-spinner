import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLoading from '../hooks/useLoading';

describe('Library Function Performance Benchmarks', () => {
    describe('startLoading performance', () => {
        it('should measure startLoading speed', () => {
            const { result } = renderHook(() => useLoading());

            const startTime = performance.now();
            for (let i = 0; i < 1000; i++) {
                act(() => {
                    result.current.startLoading();
                });
            }
            const endTime = performance.now();
            const avgTime = (endTime - startTime) / 1000;

            console.log(`startLoading (1000 ops): ${avgTime.toFixed(4)}ms per op`);
            expect(avgTime).toBeLessThan(1); // Should be very fast
        });
    });

    describe('stopLoading performance', () => {
        it('should measure stopLoading speed', () => {
            const { result } = renderHook(() => useLoading());

            const startTime = performance.now();
            for (let i = 0; i < 1000; i++) {
                act(() => {
                    result.current.stopLoading();
                });
            }
            const endTime = performance.now();
            const avgTime = (endTime - startTime) / 1000;

            console.log(`stopLoading (1000 ops): ${avgTime.toFixed(4)}ms per op`);
            expect(avgTime).toBeLessThan(1);
        });
    });

    describe('start/stop cycles', () => {
        it('should measure start/stop cycle speed', () => {
            const { result } = renderHook(() => useLoading());

            const startTime = performance.now();
            for (let i = 0; i < 500; i++) {
                act(() => {
                    result.current.startLoading();
                    result.current.stopLoading();
                });
            }
            const endTime = performance.now();
            const avgTime = (endTime - startTime) / 500;

            console.log(`start/stop cycle (500 cycles): ${avgTime.toFixed(4)}ms per cycle`);
            expect(avgTime).toBeLessThan(2);
        });
    });

    describe('asyncUseLoading performance', () => {
        it('should measure asyncUseLoading overhead', async () => {
            const { result } = renderHook(() => useLoading());

            const startTime = performance.now();
            for (let i = 0; i < 100; i++) {
                await act(async () => {
                    await result.current.asyncUseLoading(Promise.resolve(i));
                });
            }
            const endTime = performance.now();
            const avgTime = (endTime - startTime) / 100;

            console.log(`asyncUseLoading (100 ops): ${avgTime.toFixed(4)}ms per op`);
            expect(avgTime).toBeLessThan(5);
        });
    });

    describe('overrideLoading performance', () => {
        it('should measure overrideLoading speed', () => {
            const { result } = renderHook(() => useLoading());

            const startTime = performance.now();
            for (let i = 0; i < 1000; i++) {
                act(() => {
                    result.current.overrideLoading(true);
                    result.current.overrideLoading(false);
                    result.current.overrideLoading(null);
                });
            }
            const endTime = performance.now();
            const avgTime = (endTime - startTime) / 3000;

            console.log(`overrideLoading (3000 ops): ${avgTime.toFixed(4)}ms per op`);
            expect(avgTime).toBeLessThan(1);
        });
    });

    describe('multiple instances', () => {
        it('should measure performance with multiple hook instances', () => {
            const instances = Array.from({ length: 10 }, () => renderHook(() => useLoading()));

            const startTime = performance.now();
            for (let i = 0; i < 100; i++) {
                act(() => {
                    instances.forEach(inst => inst.result.current.startLoading());
                });
                act(() => {
                    instances.forEach(inst => inst.result.current.stopLoading());
                });
            }
            const endTime = performance.now();
            const avgTime = (endTime - startTime) / 100;

            console.log(`10 instances start/stop (100 cycles): ${avgTime.toFixed(4)}ms per cycle`);
            expect(avgTime).toBeLessThan(5);
        });
    });
});
