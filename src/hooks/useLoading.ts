import { useId } from 'react';
import { loadingStore } from '../store/loadingStore';

export default function useLoading() {
    const instanceId = useId();
    const { actions } = loadingStore((state) => state);
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
export * from '../store/loadingStore'