import type { Request, Response, NextFunction } from "express";
import { BaseResponse } from "../response/base.response.js";
import { mapAuthError } from "./map-auth-error.js";
import type { Result } from "../result/result.js";
import type { ErrorShape } from "../errors/error.shape.js";

export function handle<T>(
  controller: (
    req: Request
  ) => Promise<Result<T, ErrorShape>>
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const result = await controller(req);

      if (!result.ok) {
        return mapAuthError(result.error)
          .send(res);
      }

      return new BaseResponse(
        result.value,
        "Success",
        200
      ).send(res);

    } catch (error) {

      return mapAuthError({
        kind: "infrastructure",
        message:
          "Something went wrong. Please try again later.",
        timestamp: new Date(),
      }).send(res);

    }

  };
}