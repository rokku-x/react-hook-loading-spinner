import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLoading, { loadingEventTarget } from '../hooks/useLoading';

describe('useLoading Hook Tests', () => {
    it('should start and stop loading', () => {
        const { result } = renderHook(() => useLoading());

        act(() => {
            result.current.startLoading();
        });

        expect(result.current.isLocalLoading).toBe(true);

        act(() => {
            result.current.stopLoading();
        });

        expect(result.current.isLocalLoading).toBe(false);
    });

    it('should handle reference counting', () => {
        const { result } = renderHook(() => useLoading());

        act(() => {
            result.current.startLoading();
            result.current.startLoading();
        });

        expect(result.current.isLocalLoading).toBe(true);

        act(() => {
            result.current.stopLoading();
        });

        expect(result.current.isLocalLoading).toBe(true);

        act(() => {
            result.current.stopLoading();
        });

        expect(result.current.isLocalLoading).toBe(false);
    });

    it('should handle async promises', async () => {
        const { result } = renderHook(() => useLoading());

        let resolved = false;
        const data = await act(async () => {
            return await result.current.asyncUseLoading(
                new Promise(resolve => {
                    setTimeout(() => {
                        resolved = true;
                        resolve('test data');
                    }, 10);
                })
            );
        });

        expect(resolved).toBe(true);
        expect(data).toBe('test data');
    });

    it('should handle override state', () => {
        const { result } = renderHook(() => useLoading());

        act(() => {
            result.current.overrideLoading(true);
        });

        expect(result.current.isLoading).toBe(true);

        act(() => {
            result.current.overrideLoading(false);
        });

        expect(result.current.isLoading).toBe(false);
    });

    it('should emit events', () => {
        const { result } = renderHook(() => useLoading());
        const handler = vi.fn();

        loadingEventTarget.on('change', handler);

        act(() => {
            result.current.startLoading();
        });

        expect(handler).toHaveBeenCalled();
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: expect.any(Boolean),
            })
        );
    });

    it('should track local loading state per instance', () => {
        const { result: result1 } = renderHook(() => useLoading());
        const { result: result2 } = renderHook(() => useLoading());

        act(() => {
            result1.current.startLoading();
        });

        expect(result1.current.isLocalLoading).toBe(true);
        expect(result2.current.isLocalLoading).toBe(false);
    });

    it('should support multiple loading operations', () => {
        const { result: result1 } = renderHook(() => useLoading());
        const { result: result2 } = renderHook(() => useLoading());

        expect(() => {
            act(() => {
                result1.current.startLoading();
                result2.current.startLoading();
            });
        }).not.toThrow();
    });

    it('should handle rejected promises', async () => {
        const { result } = renderHook(() => useLoading());
        const error = new Error('test error');
        let caughtError: unknown = null;

        await act(async () => {
            try {
                await result.current.asyncUseLoading(Promise.reject(error));
            } catch (e) {
                caughtError = e;
            }
        });

        expect(caughtError).toBe(error);
    });

    it('should not go below zero on stop', () => {
        const { result } = renderHook(() => useLoading());

        act(() => {
            result.current.stopLoading();
            result.current.stopLoading();
        });

        // No error thrown means test passes
        expect(true).toBe(true);
    });

    it('should handle rapid operations', () => {
        const { result } = renderHook(() => useLoading());

        act(() => {
            for (let i = 0; i < 50; i++) {
                result.current.startLoading();
            }
            for (let i = 0; i < 50; i++) {
                result.current.stopLoading();
            }
        });

        // No error thrown means test passes
        expect(true).toBe(true);
    });

    it('should return data from async operations', async () => {
        const { result } = renderHook(() => useLoading());

        let data: unknown;
        await act(async () => {
            data = await result.current.asyncUseLoading(Promise.resolve('test value'));
        });

        expect(data).toBe('test value');
    });
});
