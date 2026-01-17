import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import EventEmitter from '@/utils/EventEmitter';
import { act, useId } from 'react';

type LoadingEvents = {
    change: { isLoading: boolean, isOverrideState: boolean } | null;
    start: null;
    stop: null;
};

export const loadingEventTarget = new EventEmitter<LoadingEvents>();

interface Store {
    loadingCount: number;
    overrideState: boolean | null;
    localCounters: Record<string, number>;
    isLoading: () => boolean;
    actions: {
        isGlobalLoading: () => boolean;
        startLoading: (instanceId?: string) => void;
        stopLoading: (instanceId?: string) => void;
        overrideLoading: (state: boolean | null) => void;
        getLocalCounter: (instanceId: string) => number;
        isLocalLoading: (instanceId: string) => boolean;
    }
}

const useLoadingStore = create<Store>()(devtools((set, get) => ({
    loadingCount: 0,
    overrideState: null,
    localCounters: {},
    isLoading() {
        return get().overrideState ?? (get().loadingCount > 0);
    },
    actions: {
        isGlobalLoading() {
            return get().isLoading()
        },
        startLoading: (instanceId?: string) => {
            const prevIsLoading = get().isLoading();
            set((state) => ({ loadingCount: state.loadingCount + 1 }));
            if (instanceId) {
                set((state) => ({
                    localCounters: {
                        ...state.localCounters,
                        [instanceId]: (state.localCounters[instanceId] ?? 0) + 1,
                    }
                }));
            }
            const newIsLoading = get().isLoading();
            if (newIsLoading && !prevIsLoading) {
                loadingEventTarget.emit('start', null);
            }
            loadingEventTarget.emit('change', { isLoading: newIsLoading, isOverrideState: get().overrideState !== null });
        },
        stopLoading: (instanceId?: string) => {
            const prevIsLoading = get().isLoading();
            const localCounter = instanceId ? (get().localCounters[instanceId] ?? 0) : 0;

            if (instanceId && localCounter > 0) {
                set((state) => ({
                    loadingCount: Math.max(0, state.loadingCount - 1),
                    localCounters: {
                        ...state.localCounters,
                        [instanceId]: Math.max(0, state.localCounters[instanceId] - 1),
                    }
                }));
            }

            const newIsLoading = get().isLoading();
            if (!newIsLoading && prevIsLoading) {
                loadingEventTarget.emit('stop', null);
            }
            loadingEventTarget.emit('change', { isLoading: newIsLoading, isOverrideState: get().overrideState !== null });
        },
        overrideLoading: (state: boolean | null) => {
            const prevIsLoading = get().isLoading();
            set({ overrideState: state });
            const newIsLoading = get().isLoading();
            if (newIsLoading && !prevIsLoading) {
                loadingEventTarget.emit('start', null);
            } else if (!newIsLoading && prevIsLoading) {
                loadingEventTarget.emit('stop', null);
            }
            loadingEventTarget.emit('change', { isLoading: newIsLoading, isOverrideState: state !== null });
        },
        getLocalCounter: (instanceId: string) => {
            return get().localCounters[instanceId] ?? 0;
        },
        isLocalLoading: (instanceId: string) => {
            return (get().localCounters[instanceId] ?? 0) > 0;
        },
    }
})));

export default function useLoading() {
    const instanceId = useId();
    const { actions } = useLoadingStore((state) => state);
    const localStartLoading = () => {
        actions.startLoading(instanceId);
    }

    const localStopLoading = () => {
        if (actions.isLocalLoading(instanceId)) {
            actions.stopLoading(instanceId);
        }
    }

    const asyncUseLoading = async <R, _ extends any[]>(
        asyncFunction: Promise<R>
    ): Promise<R> => {
        localStartLoading();
        try {
            return await asyncFunction;
        } finally {
            localStopLoading();
        }
    }

    return {
        overrideLoading: actions.overrideLoading,
        startLoading: localStartLoading,
        stopLoading: localStopLoading,
        get isLocalLoading() {
            return actions.isLocalLoading(instanceId);
        },
        asyncUseLoading,
        get isLoading() {
            return actions.isGlobalLoading();
        }
    };
};