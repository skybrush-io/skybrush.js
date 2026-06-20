import { useEffect } from 'react';

type AsyncEffect<T> = (isMounted: () => boolean) => T | Promise<T>;
type AsyncEffectDisposer<T> = (result: T) => void;

function useAsyncEffect<T>(
  effect: AsyncEffect<T>,
  destroy?: AsyncEffectDisposer<T>,
  inputs?: any[]
): void;
function useAsyncEffect<T>(effect: AsyncEffect<T>, inputs?: any[]): void;
function useAsyncEffect<T>(
  effect: (isMounted: () => boolean) => T | Promise<T>,
  ...args: any[]
) {
  const maybeDestroy: AsyncEffectDisposer<T> | any[] | undefined =
    args.length > 0 ? args[0] : undefined;
  const destroy: AsyncEffectDisposer<T> | undefined =
    typeof maybeDestroy === 'function' ? maybeDestroy : undefined;
  const inputs: any[] = destroy ? args[1] : maybeDestroy;

  useEffect(() => {
    var result: T;
    var mounted = true;
    var maybePromise = effect(function () {
      return mounted;
    });

    Promise.resolve(maybePromise).then(function (value) {
      result = value;
    });

    return () => {
      mounted = false;

      if (destroy) {
        destroy(result);
      }
    };
  }, inputs);
}

export default useAsyncEffect;
