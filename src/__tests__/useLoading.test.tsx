import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLoading, { loadingEventTarget } from '../hooks/useLoading';

describe('useLoading Hook - Advanced Tests', () => {
    afterEach(() => {
        loadingEventTarget.removeAllListeners();
    });

    describe('local vs global loading state', () => {
        it('should distinguish between local and global loading', () => {
            const { result: hook1 } = renderHook(() => useLoading());
            const { result: hook2 } = renderHook(() => useLoading());

            act(() => {
                hook1.current.startLoading();
            });

            expect(hook1.current.isLocalLoading).toBe(true);
            expect(hook1.current.isLoading).toBe(true);
            expect(hook2.current.isLocalLoading).toBe(false);
        });

        it('should track local counter per instance', () => {
            const { result: hook1 } = renderHook(() => useLoading());
            const { result: hook2 } = renderHook(() => useLoading());

            act(() => {
                hook1.current.startLoading();
                hook1.current.startLoading();
            });

            act(() => {
                hook2.current.startLoading();
            });

            expect(hook1.current.isLocalLoading).toBe(true);
            expect(hook2.current.isLocalLoading).toBe(true);

            act(() => {
                hook1.current.stopLoading();
            });

            expect(hook1.current.isLocalLoading).toBe(true);
            expect(hook2.current.isLocalLoading).toBe(true);
        });
    });

    describe('reference counting correctness', () => {
        it('should support multiple start calls before stop', () => {
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
        });

        it('should handle stop without start gracefully', () => {
            const { result } = renderHook(() => useLoading());

            expect(() => {
                act(() => {
                    result.current.stopLoading();
                    result.current.stopLoading();
                });
            }).not.toThrow();

            expect(result.current.isLocalLoading).toBe(false);
        });

        it('should maintain local loading state across operations', () => {
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
    });

    describe('override loading state', () => {
        it('should support override to true', () => {
            const { result } = renderHook(() => useLoading());

            act(() => {
                result.current.overrideLoading(true);
            });

            expect(result.current.isLoading).toBe(true);
        });

        it('should support override to false', () => {
            const { result } = renderHook(() => useLoading());

            act(() => {
                result.current.overrideLoading(false);
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('should accept null to clear override', () => {
            const { result } = renderHook(() => useLoading());

            expect(() => {
                act(() => {
                    result.current.overrideLoading(true);
                    result.current.overrideLoading(null);
                });
            }).not.toThrow();
        });

        it('should work with multiple instances', () => {
            const { result: hook1 } = renderHook(() => useLoading());
            const { result: hook2 } = renderHook(() => useLoading());

            expect(() => {
                act(() => {
                    hook1.current.startLoading();
                    hook2.current.overrideLoading(false);
                });
            }).not.toThrow();
        });
    });

    describe('async promise wrapping', () => {
        it('should manage loading state for async operations', async () => {
            const { result } = renderHook(() => useLoading());

            expect(result.current.isLoading).toBe(false);

            await act(async () => {
                await result.current.asyncUseLoading(Promise.resolve('data'));
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('should return promise result', async () => {
            const { result } = renderHook(() => useLoading());
            const testData = { id: 1, name: 'test' };

            const data = await act(async () => {
                return await result.current.asyncUseLoading(Promise.resolve(testData));
            });

            expect(data).toEqual(testData);
        });

        it('should handle promise rejection', async () => {
            const { result } = renderHook(() => useLoading());
            const testError = new Error('Test error');

            let caught = null;

            await act(async () => {
                try {
                    await result.current.asyncUseLoading(Promise.reject(testError));
                } catch (e) {
                    caught = e;
                }
            });

            expect(caught).toBe(testError);
        });

        it('should still stop loading on promise rejection', async () => {
            const { result } = renderHook(() => useLoading());

            await act(async () => {
                try {
                    await result.current.asyncUseLoading(Promise.reject(new Error('test')));
                } catch (e) {
                    // Ignore
                }
            });

            expect(result.current.isLocalLoading).toBe(false);
        });

        it('should handle nested async calls', async () => {
            const { result } = renderHook(() => useLoading());

            await act(async () => {
                await result.current.asyncUseLoading(
                    (async () => {
                        const inner = await result.current.asyncUseLoading(
                            Promise.resolve('nested')
                        );
                        return inner;
                    })()
                );
            });

            expect(result.current.isLocalLoading).toBe(false);
        });

        it('should handle delayed promise resolution', async () => {
            const { result } = renderHook(() => useLoading());

            const promise = new Promise(resolve => {
                setTimeout(() => resolve('delayed'), 50);
            });

            await act(async () => {
                await result.current.asyncUseLoading(promise);
            });

            expect(result.current.isLocalLoading).toBe(false);
        });
    });

    describe('event emissions', () => {
        it('should emit events when loading state changes', () => {
            const changeHandler = vi.fn();
            loadingEventTarget.on('change', changeHandler);

            const { result } = renderHook(() => useLoading());

            act(() => {
                result.current.startLoading();
            });

            expect(changeHandler).toHaveBeenCalled();
        });

        it('should emit multiple events on state transitions', () => {
            const changeHandler = vi.fn();
            loadingEventTarget.on('change', changeHandler);

            const { result } = renderHook(() => useLoading());

            const callsBefore = changeHandler.mock.calls.length;

            act(() => {
                result.current.startLoading();
                result.current.startLoading();
            });

            expect(changeHandler.mock.calls.length).toBeGreaterThan(callsBefore);
        });

        it('should support on and once listeners', () => {
            const onHandler = vi.fn();
            const onceHandler = vi.fn();

            loadingEventTarget.on('change', onHandler);
            loadingEventTarget.once('change', onceHandler);

            const { result } = renderHook(() => useLoading());

            act(() => {
                result.current.startLoading();
            });

            expect(onHandler).toHaveBeenCalled();
            expect(onceHandler).toHaveBeenCalled();
        });

        it('should handle event listener cleanup', () => {
            const handler = vi.fn();
            loadingEventTarget.on('change', handler);

            const { result } = renderHook(() => useLoading());

            act(() => {
                result.current.startLoading();
            });

            const callCount = handler.mock.calls.length;

            loadingEventTarget.removeAllListeners();

            act(() => {
                result.current.stopLoading();
            });

            expect(handler.mock.calls.length).toBe(callCount);
        });
    });

    describe('multiple hook instances', () => {
        it('should track independent local states', () => {
            const { result: hook1 } = renderHook(() => useLoading());
            const { result: hook2 } = renderHook(() => useLoading());

            act(() => {
                hook1.current.startLoading();
            });

            expect(hook1.current.isLocalLoading).toBe(true);
            expect(hook2.current.isLocalLoading).toBe(false);

            act(() => {
                hook2.current.startLoading();
            });

            expect(hook1.current.isLocalLoading).toBe(true);
            expect(hook2.current.isLocalLoading).toBe(true);

            act(() => {
                hook1.current.stopLoading();
            });

            expect(hook1.current.isLocalLoading).toBe(false);
            expect(hook2.current.isLocalLoading).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle rapid start/stop sequences', () => {
            const { result } = renderHook(() => useLoading());

            expect(() => {
                act(() => {
                    for (let i = 0; i < 100; i++) {
                        result.current.startLoading();
                        result.current.stopLoading();
                    }
                });
            }).not.toThrow();

            expect(result.current.isLocalLoading).toBe(false);
        });

        it('should handle multiple concurrent instances', () => {
            const instances = [];

            for (let i = 0; i < 5; i++) {
                instances.push(renderHook(() => useLoading()));
            }

            expect(() => {
                act(() => {
                    instances.forEach(inst => inst.result.current.startLoading());
                });
            }).not.toThrow();

            expect(instances[0].result.current.isLocalLoading).toBe(true);
            expect(instances[1].result.current.isLocalLoading).toBe(true);
        });

        it('should handle instance cleanup without errors', () => {
            const { result: hook1, unmount: unmount1 } = renderHook(() => useLoading());

            expect(() => {
                act(() => {
                    hook1.current.startLoading();
                });

                unmount1();
            }).not.toThrow();
        });
    });
});
