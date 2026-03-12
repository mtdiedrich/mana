import { useCallback, useRef } from "react";

/** A stable debounce hook that always calls the latest version of the function */
export function useDebounce<T extends (...args: never[]) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fnRef.current(...args), ms);
    },
    [ms],
  );
}
