// Compose cancellation and a deadline without relying on AbortSignal.any/timeout
// support. The first abort wins, and a completed request releases its timer.
export function requestDeadline(
  caller?: AbortSignal | null,
  milliseconds = 30_000,
) {
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () =>
    controller.abort(
      caller?.reason ?? new DOMException("Request cancelled", "AbortError"),
    );
  if (caller?.aborted) cancel();
  else caller?.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(() => {
    if (!controller.signal.aborted) {
      timedOut = true;
      controller.abort(new DOMException("Request timed out", "TimeoutError"));
    }
  }, milliseconds);
  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    run<T>(operation: () => Promise<T>): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        const abort = () => reject(controller.signal.reason);
        if (controller.signal.aborted) {
          abort();
          return;
        }
        controller.signal.addEventListener("abort", abort, { once: true });
        Promise.resolve()
          .then(() => {
            if (controller.signal.aborted) throw controller.signal.reason;
            return operation();
          })
          .then(
            (value) => {
              controller.signal.removeEventListener("abort", abort);
              resolve(value);
            },
            (error) => {
              controller.signal.removeEventListener("abort", abort);
              reject(error);
            },
          );
      });
    },
    dispose() {
      clearTimeout(timer);
      caller?.removeEventListener("abort", cancel);
    },
  };
}
