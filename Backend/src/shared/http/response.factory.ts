import { BaseErrorResponse } from "../response/base.error.response.js";
import { BaseResponse } from "../response/base.response.js";

export class ResponseFactory {
  static ok<T>(
    data: T,
    message = "Success"
  ) {
    return new BaseResponse(
      data,
      message,
      200
    );
  }

  static created<T>(
    data: T,
    message = "Resource created successfully."
  ) {
    return new BaseResponse(
      data,
      message,
      201
    );
  }

  static accepted<T>(
    data: T,
    message = "Request accepted."
  ) {
    return new BaseResponse(
      data,
      message,
      202
    );
  }

  static noContent() {
    return new BaseResponse(
      null,
      "No Content",
      204
    );
  }

  static badRequest(
    message = "Bad Request"
  ) {
    return new BaseErrorResponse(
      message,
      400
    );
  }

  static unauthorized(
    message = "Unauthorized"
  ) {
    return new BaseErrorResponse(
      message,
      401
    );
  }

  static forbidden(
    message = "Forbidden"
  ) {
    return new BaseErrorResponse(
      message,
      403
    );
  }

  static notFound(
    message = "Resource not found."
  ) {
    return new BaseErrorResponse(
      message,
      404
    );
  }

  static conflict(
    message = "Conflict"
  ) {
    return new BaseErrorResponse(
      message,
      409
    );
  }

  static internalServerError(
    message = "Something went wrong."
  ) {
    return new BaseErrorResponse(
      message,
      500
    );
  }
}