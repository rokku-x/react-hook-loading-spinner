type EventMap = Record<string, any>;

export default class EventEmitter<T extends EventMap> extends EventTarget {
    private controller = new AbortController();

    on<K extends keyof T>(type: K, callback: (detail: T[K]) => void): this {
        this.addEventListener(
            type as string,
            (e: Event) => callback((e as CustomEvent).detail),
            { signal: this.controller.signal }
        );
        return this;
    }

    once<K extends keyof T>(type: K, callback: (detail: T[K]) => void): this {
        this.addEventListener(
            type as string,
            (e: Event) => callback((e as CustomEvent).detail),
            {
                signal: this.controller.signal,
                once: true
            }
        );
        return this;
    }

    emit<K extends keyof T>(type: K, detail: T[K]): boolean {
        return this.dispatchEvent(new CustomEvent(type as string, { detail }));
    }

    removeAllListeners(): void {
        this.controller.abort();
        this.controller = new AbortController();
    }
}