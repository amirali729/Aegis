/**
 * Represents the result of an operation.
 *
 * If `ok` is true, the operation succeeded and `value` contains the result.
 * If `ok` is false, the operation failed and `error` contains the reason.
 */
export type Result<T, E> =
  | {
      readonly ok: true;
      readonly value: T;
    }
  | {
      readonly ok: false;
      readonly error: E;
    };

/**
 * Creates a successful result.
 */
export function ok<T>(value: T): Result<T, never> {
  return {
    ok: true,
    value,
  };
}

/**
 * Creates a failed result.
 */
export function err<E>(error: E): Result<never, E> {
  return {
    ok: false,
    error,
  };
}