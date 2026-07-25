/**
 * Base contract that every application error must implement.
 */
export interface ErrorShape {
  /**
   * Unique identifier for the error.
   * Used by the error mapper.
   *
   * Examples:
   *  - validation_error
   *  - unauthorized
   *  - user_not_found
   *  - infrastructure
   */
  readonly kind: string;

  /**
   * Human-readable error message.
   */
  readonly message: string;

  /**
   * Time when the error was created.
   */
  readonly timestamp: Date;
}
