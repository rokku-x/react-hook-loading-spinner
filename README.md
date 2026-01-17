# react-hook-loading-spinner

A lightweight and flexible React loading state hook library with built-in spinner components, global state management, and zero dependencies (except React and Zustand).

## Installation

```bash
npm install @rokku-x/react-hook-loading-spinner
```

## Features

- 🎯 **Global Loading State** - Centralized loading management across your entire app
- 🪝 **React Hooks API** - Easy-to-use hook-based interface with automatic cleanup
- 🔄 **Reference Counting** - Multiple components can start/stop loading independently
- ⚡ **Async/Await Support** - Built-in async wrapper for promises
- 🎨 **Customizable Spinners** - Pre-built components or bring your own
- 📦 **TypeScript Support** - Full type safety out of the box
- 🎭 **Multiple Animations** - Spin, fade, or no animation
- 📡 **Event System** - Subscribe to loading state changes
- ♿ **Accessibility** - Built-in inert attribute and scroll prevention
- 📱 **Zero Dependencies** - Only requires React and Zustand
- 🌐 **SSR-Compatible** - Hooks work in SSR; use `ssrLoading` helper in Server Components

## Bundle Size

- ESM: 4.23 kB gzipped (12.80 kB raw)
- CJS: 3.67 kB gzipped (9.31 kB raw)

## Runtime Performance

- **startLoading()**: 0.025ms per operation
- **stopLoading()**: 0.0006ms per operation
- **start/stop cycle**: 0.023ms per cycle
- **asyncUseLoading()**: 0.076ms per operation (overhead)
- **overrideLoading()**: 0.011ms per operation
- **10 instances start/stop**: 0.269ms per cycle

All measurements are extremely fast, with even 1000 operations completing in milliseconds. Measurements based on actual benchmarks in test suite.

## Quick Start

### 1. Setup the Loading Renderer

First, add the `LoadingRenderer` at the root of your application:

```tsx
import { LoadingRenderer } from '@rokku-x/react-hook-loading-spinner';

function App() {
  return (
    <>
      <YourComponents />
      <LoadingRenderer />
    </>
  );
}
```

### 2. Use the Loading Hook

```tsx
import { useLoading } from '@rokku-x/react-hook-loading-spinner';

function MyComponent() {
  const { startLoading, stopLoading, isLoading } = useLoading();
  
  const handleClick = async () => {
    startLoading();
    try {
      await fetchData();
    } finally {
      stopLoading();
    }
  };
  
  return (
    <button onClick={handleClick} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Fetch Data'}
    </button>
  );
}
```

## API Reference

### LoadingRenderer

The main component that renders the loading spinner overlay. Must be mounted at the root level.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loadingComponent` | `React.ComponentType \| React.ReactElement` | `LoadingCircle` | Custom loading component to display |
| `loadingComponentScale` | `number` | `1` | Scale factor for the loading component |
| `animationType` | `AnimationType` | `AnimationType.Spin` | Animation type: `'spin'`, `'fadeInOut'`, or `'none'` |
| `animationDuration` | `number` | `1` (spin) or `2` (fade) | Animation duration in seconds |
| `wrapperStyle` | `CSSProperties` | `undefined` | Inline styles for the dialog wrapper |
| `wrapperClassName` | `string` | `undefined` | CSS class for the dialog wrapper |
| `wrapperId` | `string` | `'loading-wrapper-{random}'` | Unique identifier for the wrapper |
| `animationWrapperStyle` | `CSSProperties` | `undefined` | Inline styles for the animation wrapper |
| `animationWrapperClassName` | `string` | `undefined` | CSS class for the animation wrapper |
| `animationWrapperId` | `string` | `undefined` | ID for the animation wrapper |

#### Built-in Loading Components

| Component | Description |
|-----------|-------------|
| `LoadingCircle` | Spinning circle spinner (default) |
| `LoadingPleaseWait` | "Please wait..." text |

### useLoading

Hook for managing loading state in your components.

#### Returns

```typescript
{
  startLoading: () => void,
  stopLoading: () => void,
  asyncUseLoading: <R>(promise: Promise<R>) => Promise<R>,
  overrideLoading: (state: boolean | null) => void,
  isLoading: boolean,
  isLocalLoading: boolean
}
```

| Return Value | Type | Description |
|---|---|---|
| `startLoading` | `() => void` | Increment the loading counter (starts loading) |
| `stopLoading` | `() => void` | Decrement the loading counter (stops loading when reaches 0) |
| `asyncUseLoading` | `<R>(promise: Promise<R>) => Promise<R>` | Wrap a promise to automatically manage loading state |
| `overrideLoading` | `(state: boolean \| null) => void` | Override the loading state (null = remove override) |
| `isLoading` | `boolean` | Global loading state (true if any component is loading) |
| `isLocalLoading` | `boolean` | Local loading state for this hook instance only |

### Loading Component

A component that triggers loading state based on a prop.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | `boolean` | `false` | Whether to show loading state |

#### Example

```tsx
import { Loading } from 'react-hook-loading-spinner';

function MyComponent() {
  const [fetching, setFetching] = useState(false);
  
  return (
    <>
      <Loading isLoading={fetching} />
      {/* Your component */}
    </>
  );
}
```

### AnimationType

```typescript
const AnimationType = {
  Spin: 'spin',
  FadeInOut: 'fadeInOut',
  None: 'none',
} as const;
```

### loadingEventTarget

Event emitter for subscribing to loading state changes.

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `'change'` | `{ isLoading: boolean, isOverrideState: boolean }` | Emitted whenever loading state changes |
| `'start'` | `null` | Emitted when loading starts (transitions from false to true) |
| `'stop'` | `null` | Emitted when loading stops (transitions from true to false) |

#### Example

```tsx
import { loadingEventTarget } from 'react-hook-loading-spinner';

useEffect(() => {
  const listener = loadingEventTarget.on('change', ({ isLoading }) => {
    console.log('Loading state changed:', isLoading);
  });
  
  return () => listener.removeAllListeners();
}, []);
```

## Examples

### Example 1: Basic Loading

```tsx
import { useLoading, LoadingRenderer } from 'react-hook-loading-spinner';

function App() {
  return (
    <>
      <BasicLoadingExample />
      <LoadingRenderer />
    </>
  );
}

function BasicLoadingExample() {
  const { startLoading, stopLoading } = useLoading();
  
  const handleFetch = async () => {
    startLoading();
    try {
      await fetch('https://api.example.com/data');
    } finally {
      stopLoading();
    }
  };
  
  return <button onClick={handleFetch}>Fetch Data</button>;
}
```

### Example 2: Async Wrapper

The `asyncUseLoading` method automatically manages loading state for promises.

```tsx
import { useLoading, LoadingRenderer } from 'react-hook-loading-spinner';

function AsyncExample() {
  const { asyncUseLoading } = useLoading();
  
  const handleFetch = async () => {
    // Loading state is automatically managed
    const data = await asyncUseLoading(
      fetch('https://api.example.com/data').then(res => res.json())
    );
    console.log(data);
  };
  
  return <button onClick={handleFetch}>Fetch Data</button>;
}

function App() {
  return (
    <>
      <AsyncExample />
      <LoadingRenderer />
    </>
  );
}
```

### Example 3: Multiple Loading States

Multiple components can start loading independently. The loading indicator stays visible until all have stopped.

```tsx
import { useLoading, LoadingRenderer } from 'react-hook-loading-spinner';

function MultipleLoadingExample() {
  const { asyncUseLoading } = useLoading();
  
  const fetchUser = () => asyncUseLoading(
    fetch('https://api.example.com/user').then(res => res.json())
  );
  
  const fetchPosts = () => asyncUseLoading(
    fetch('https://api.example.com/posts').then(res => res.json())
  );
  
  const fetchAll = async () => {
    // Both requests will show loading
    // Loading stops when both complete
    await Promise.all([fetchUser(), fetchPosts()]);
  };
  
  return (
    <div>
      <button onClick={fetchUser}>Fetch User</button>
      <button onClick={fetchPosts}>Fetch Posts</button>
      <button onClick={fetchAll}>Fetch All</button>
    </div>
  );
}

function App() {
  return (
    <>
      <MultipleLoadingExample />
      <LoadingRenderer />
    </>
  );
}
```

### Example 4: Local Loading State

Track loading state for individual components without affecting global state visibility.

```tsx
import { useLoading, LoadingRenderer } from 'react-hook-loading-spinner';

function LocalLoadingExample() {
  const { startLoading, stopLoading, isLocalLoading } = useLoading();
  
  const handleClick = async () => {
    startLoading();
    try {
      await fetch('https://api.example.com/data');
    } finally {
      stopLoading();
    }
  };
  
  return (
    <button onClick={handleClick} disabled={isLocalLoading}>
      {isLocalLoading ? 'Loading...' : 'Fetch Data'}
    </button>
  );
}

function App() {
  return (
    <>
      <LocalLoadingExample />
      <LoadingRenderer />
    </>
  );
}
```

### Example 5: Override Loading State

Force loading state on or off, bypassing the reference counting.

```tsx
import { useLoading, LoadingRenderer } from 'react-hook-loading-spinner';

function OverrideExample() {
  const { overrideLoading, isLoading } = useLoading();
  
  const forceLoading = () => overrideLoading(true);
  const clearOverride = () => overrideLoading(null);
  
  return (
    <div>
      <button onClick={forceLoading}>Force Loading</button>
      <button onClick={clearOverride}>Clear Override</button>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
    </div>
  );
}

function App() {
  return (
    <>
      <OverrideExample />
      <LoadingRenderer />
    </>
  );
}
```

### Example 6: Custom Loading Component

```tsx
import { LoadingRenderer } from 'react-hook-loading-spinner';

const CustomSpinner = () => (
  <div style={{
    width: '100px',
    height: '100px',
    border: '10px solid #e0e0e0',
    borderTop: '10px solid #3498db',
    borderRadius: '50%',
  }} />
);

function App() {
  return (
    <>
      <YourComponents />
      <LoadingRenderer 
        loadingComponent={CustomSpinner}
        loadingComponentScale={1.5}
      />
    </>

### SSR Usage

For Server Components, use the SSR-safe helper instead of the client hook:

```tsx
import { ssrLoading } from '@rokku-x/react-hook-loading-spinner';

export default function ServerComponent() {
  const { startLoading, stopLoading, isLoading } = ssrLoading();

  startLoading();
  // ...run your server-side work
  stopLoading();

  return <div>{isLoading ? 'Loading…' : 'Done'}</div>;
}
```

For Client Components, continue using `useLoading` as shown above.
  );
}
```

### Example 7: Fade Animation

```tsx
import { LoadingRenderer, AnimationType, LoadingPleaseWait } from 'react-hook-loading-spinner';

function App() {
  return (
    <>
      <YourComponents />
      <LoadingRenderer 
        loadingComponent={LoadingPleaseWait}
        animationType={AnimationType.FadeInOut}
        animationDuration={1.5}
      />
    </>
  );
}
```

### Example 8: Custom Styling

```tsx
import { LoadingRenderer, LoadingCircle } from 'react-hook-loading-spinner';

function App() {
  return (
    <>
      <YourComponents />
      <LoadingRenderer 
        loadingComponent={LoadingCircle}
        wrapperStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(5px)',
        }}
        animationWrapperStyle={{
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}
      />
    </>
  );
}
```

### Example 9: Loading Component Prop

Use the `<Loading>` component to trigger loading based on a boolean prop.

```tsx
import { Loading, LoadingRenderer } from 'react-hook-loading-spinner';
import { useState } from 'react';

function LoadingComponentExample() {
  const [isFetching, setIsFetching] = useState(false);
  
  const handleFetch = async () => {
    setIsFetching(true);
    try {
      await fetch('https://api.example.com/data');
    } finally {
      setIsFetching(false);
    }
  };
  
  return (
    <div>
      <Loading isLoading={isFetching} />
      <button onClick={handleFetch}>Fetch Data</button>
    </div>
  );
}

function App() {
  return (
    <>
      <LoadingComponentExample />
      <LoadingRenderer />
    </>
  );
}
```

### Example 10: Event Listener

Subscribe to loading state changes using the event system.

```tsx
import { loadingEventTarget, useLoading, LoadingRenderer } from 'react-hook-loading-spinner';
import { useEffect, useState } from 'react';

function EventListenerExample() {
  const { startLoading, stopLoading } = useLoading();
  const [loadingLog, setLoadingLog] = useState<string[]>([]);
  
  useEffect(() => {
    const onChange = loadingEventTarget.on('change', ({ isLoading }) => {
      setLoadingLog(prev => [...prev, `Changed: ${isLoading}`]);
    });
    
    const onStart = loadingEventTarget.on('start', () => {
      setLoadingLog(prev => [...prev, 'Started!']);
    });
    
    const onStop = loadingEventTarget.on('stop', () => {
      setLoadingLog(prev => [...prev, 'Stopped!']);
    });
    
    return () => {
      onChange.removeAllListeners();
      onStart.removeAllListeners();
      onStop.removeAllListeners();
    };
  }, []);
  
  return (
    <div>
      <button onClick={startLoading}>Start</button>
      <button onClick={stopLoading}>Stop</button>
      <ul>
        {loadingLog.map((log, i) => <li key={i}>{log}</li>)}
      </ul>
    </div>
  );
}

function App() {
  return (
    <>
      <EventListenerExample />
      <LoadingRenderer />
    </>
  );
}
```

## How It Works

### Reference Counting

The library uses a reference counting system to manage loading state:

1. Each call to `startLoading()` increments a counter
2. Each call to `stopLoading()` decrements the counter
3. Loading is active when the counter > 0
4. Multiple components can independently manage loading

### Local Tracking

Each `useLoading()` hook instance maintains its own local counter:

- `isLocalLoading` reflects only this instance's loading state
- `startLoading()`/`stopLoading()` only affect the local counter
- Local counter prevents calling `stopLoading()` more times than `startLoading()`

### Global State

The global loading state is managed by Zustand:

- `isLoading` reflects whether ANY component is loading
- Shared across all hook instances
- Can be overridden with `overrideLoading()`

## Best Practices

1. **Always pair start/stop**: Use try/finally to ensure loading stops even on errors
```tsx
const { startLoading, stopLoading } = useLoading();

const fetchData = async () => {
  startLoading();
  try {
    await api.fetchData();
  } finally {
    stopLoading(); // Always called, even on error
  }
};
```

2. **Use async wrapper**: Let the library handle cleanup automatically
```tsx
const { asyncUseLoading } = useLoading();

const fetchData = () => asyncUseLoading(api.fetchData());
```

3. **Disable buttons during loading**: Prevent duplicate requests
```tsx
const { isLocalLoading } = useLoading();

<button disabled={isLocalLoading} onClick={fetchData}>
  Fetch
</button>
```

4. **Clean up event listeners**: Remove listeners in useEffect cleanup
```tsx
useEffect(() => {
  const listener = loadingEventTarget.on('change', handleChange);
  return () => listener.removeAllListeners();
}, []);
```

## TypeScript

The library is written in TypeScript and provides full type definitions.

```typescript
import { useLoading, AnimationType } from 'react-hook-loading-spinner';
import type { AnimationTypeType } from 'react-hook-loading-spinner';

const { startLoading, stopLoading, isLoading } = useLoading();

const animation: AnimationTypeType = AnimationType.Spin;
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires support for:
  - React 18+
  - ES6+ features
  - `<dialog>` element (with polyfill if needed)
  - CSS animations

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

[https://github.com/rokku-x/react-hook-loading-spinner](https://github.com/rokku-x/react-hook-loading-spinner)
