// import type { Request, Response, NextFunction } from "express";
// import { BaseResponse } from "../response/base.response.js";
// import { mapAuthError } from "../../modules/auth/http/map-auth-error.js";
// import type { Result } from "../result/result.js";
// import type { ErrorShape } from "../errors/error.shape.js";

// export function handle<T>(
//   controller: (
//     req: Request
//   ) => Promise<Result<T, ErrorShape>>
// ) {
//   return async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {

//     try {

//       const result = await controller(req);

//       if (!result.ok) {
//         return mapAuthError(result.error)
//           .send(res);
//       }

//       return new BaseResponse(
//         result.value,
//         "Success",
//         200
//       ).send(res);

//     } catch (error) {

//       return mapAuthError({
//         kind: "infrastructure",
//         message:
//           "Something went wrong. Please try again later.",
//         timestamp: new Date(),
//       }).send(res);

//     }

//   };
// }

import type { Request, Response, NextFunction } from "express";
import type { Result } from "../result/result.js";
import { BaseResponse } from "../response/base.response.js";
import { mapAuthError } from "../../modules/auth/http/map-auth-error.js";
import { HttpStatus } from "../http/http-status.js";

export function handle<T>(
  controller: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Result<T, any>>
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const result = await controller(req, res, next);

    if (!result.ok) {
      return mapAuthError(result.error).send(res);
    }

    return new BaseResponse(
      result.value,
      HttpStatus.OK
    ).send(res);
  };
}