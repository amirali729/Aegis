export const ResponseStatusMap = {

    SuccessResponse: 200,

    CreatedResponse: 201,

    NoContentResponse: 204,

    ValidationErrorResponse: 400,

    UnauthorizedErrorResponse: 401,

    ForbiddenErrorResponse: 403,

    NotFoundErrorResponse: 404,

    ConflictErrorResponse: 409,

    InfrastructureErrorResponse: 500

} as const;