import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventEmitter from '../utils/EventEmitter';

describe('EventEmitter', () => {
    let emitter: EventEmitter<{ test: string; change: { value: number } }>;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    describe('emit and on', () => {
        it('should emit and listen to events', () => {
            const handler = vi.fn();
            emitter.on('test', handler);
            emitter.emit('test', 'hello');

            expect(handler).toHaveBeenCalledWith('hello');
        });

        it('should allow multiple listeners on same event', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();

            emitter.on('test', handler1);
            emitter.on('test', handler2);
            emitter.emit('test', 'data');

            expect(handler1).toHaveBeenCalledWith('data');
            expect(handler2).toHaveBeenCalledWith('data');
        });

        it('should handle multiple event types', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();

            emitter.on('test', handler1);
            emitter.on('change', handler2);

            emitter.emit('test', 'test data');
            emitter.emit('change', { value: 42 });

            expect(handler1).toHaveBeenCalledWith('test data');
            expect(handler2).toHaveBeenCalledWith({ value: 42 });
        });

        it('should support method chaining', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();

            const result = emitter
                .on('test', handler1)
                .on('change', handler2);

            expect(result).toBe(emitter);
        });
    });

    describe('once', () => {
        it('should listen to event only once', () => {
            const handler = vi.fn();
            emitter.once('test', handler);

            emitter.emit('test', 'first');
            emitter.emit('test', 'second');

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith('first');
        });

        it('should support chaining with once', () => {
            const handler = vi.fn();

            const result = emitter.once('test', handler);

            expect(result).toBe(emitter);
        });

        it('should allow multiple once listeners', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();

            emitter.once('test', handler1);
            emitter.once('test', handler2);

            emitter.emit('test', 'data');

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });
    });

    describe('removeAllListeners', () => {
        it('should remove all listeners', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();

            emitter.on('test', handler1);
            emitter.on('change', handler2);

            emitter.removeAllListeners();

            emitter.emit('test', 'data1');
            emitter.emit('change', { value: 10 });

            expect(handler1).not.toHaveBeenCalled();
            expect(handler2).not.toHaveBeenCalled();
        });

        it('should allow listeners to be re-added after removal', () => {
            const handler = vi.fn();

            emitter.on('test', handler);
            emitter.removeAllListeners();
            emitter.on('test', handler);
            emitter.emit('test', 'data');

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should work with mixed on and once listeners', () => {
            const onHandler = vi.fn();
            const onceHandler = vi.fn();

            emitter.on('test', onHandler);
            emitter.once('test', onceHandler);

            emitter.removeAllListeners();

            emitter.emit('test', 'data');

            expect(onHandler).not.toHaveBeenCalled();
            expect(onceHandler).not.toHaveBeenCalled();
        });
    });

    describe('emit return value', () => {
        it('should return true when event has listeners', () => {
            const handler = vi.fn();
            emitter.on('test', handler);
            const result = emitter.emit('test', 'data');

            expect(handler).toHaveBeenCalled();
        });

        it('should return false when event has no listeners', () => {
            const handler = vi.fn();
            const result = emitter.emit('test', 'data');

            expect(handler).not.toHaveBeenCalled();
        });

        it('should emit event after listeners are removed', () => {
            const handler = vi.fn();
            emitter.on('test', handler);
            emitter.removeAllListeners();

            emitter.emit('test', 'data');

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('should handle null data', () => {
            const handler = vi.fn();
            emitter.on('test', handler);

            emitter.emit('test', null as any);

            expect(handler).toHaveBeenCalledWith(null);
        });

        it('should handle complex object data', () => {
            const handler = vi.fn();
            const complexData = { nested: { deep: { value: 42 } } };

            emitter.on('test', handler);
            emitter.emit('test', complexData);

            expect(handler).toHaveBeenCalledWith(complexData);
        });

        it('should call all listeners even if one completes', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();

            emitter.on('test', handler1);
            emitter.on('test', handler2);

            emitter.emit('test', 'data');

            expect(handler1).toHaveBeenCalledWith('data');
            expect(handler2).toHaveBeenCalledWith('data');
        });
    });

    describe('listener cleanup', () => {
        it('should properly cleanup after listener is called once', () => {
            const handler = vi.fn();
            emitter.once('test', handler);

            emitter.emit('test', 'first');
            emitter.removeAllListeners();

            emitter.emit('test', 'second');

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });
});
