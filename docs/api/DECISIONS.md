# API Design Decisions

## `disableBounceOnMount` — why a negative boolean?

Bounce on mount is the default behavior of the upstream [`sakana-widget`](https://github.com/dsrkafuu/sakana-widget) library and cannot be turned off through its options. This React binding adds `disableBounceOnMount` as an opt-out prop to suppress that default behavior.

The negative naming (`disableX` instead of `enableX={false}`) reflects the fact that this wrapper is not introducing the bounce — it is providing a way to disable something the underlying library always does. A positive prop like `bounceOnMount` would imply this wrapper controls whether bouncing happens, when in reality it can only suppress it.
