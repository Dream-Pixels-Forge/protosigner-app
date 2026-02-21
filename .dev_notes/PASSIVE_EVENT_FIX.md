# Passive Event Listener Fix

## Issue
Console warnings appeared when using mouse wheel to zoom/pan the canvas:
```
Unable to preventDefault inside passive event listener invocation.
```

## Root Cause
React's synthetic event system registers wheel events as passive by default for performance. This prevents calling `preventDefault()` which is needed to stop the browser's default scroll behavior during zoom operations.

## Solution
Replaced React's `onWheel` handler with native `addEventListener` using `{ passive: false }` option.

## Changes Made

**File:** `features/canvas/Canvas.tsx`

### Before
```tsx
const handleWheel = (e: React.WheelEvent) => {
  e.preventDefault(); // ❌ Doesn't work with passive listeners
  // ... zoom/pan logic
};

<main onWheel={handleWheel}>
```

### After
```tsx
useEffect(() => {
  const canvasElement = document.querySelector('main');
  if (!canvasElement) return;

  const handleWheelEvent = (e: WheelEvent) => {
    if ((e.target as HTMLElement).closest('.custom-scrollbar')) return;
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;

    e.preventDefault(); // ✅ Works with passive: false

    if (e.ctrlKey || e.metaKey) {
      // Zoom logic
    } else {
      // Pan logic
    }
  };

  canvasElement.addEventListener('wheel', handleWheelEvent, { passive: false });
  return () => canvasElement.removeEventListener('wheel', handleWheelEvent);
}, [zoom, pan, setZoom, setPan]);

<main> {/* No onWheel prop */}
```

## Key Points

1. **Native Event Listener**: Used `addEventListener` instead of React's `onWheel`
2. **Passive: False**: Explicitly set `{ passive: false }` to allow `preventDefault()`
3. **Cleanup**: Properly removed event listener in useEffect cleanup
4. **Dependencies**: Added zoom, pan, setZoom, setPan to dependency array

## Result
✅ No more console warnings  
✅ Zoom/pan functionality works correctly  
✅ Default scroll behavior properly prevented
