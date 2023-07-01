"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.NotFoundError = exports.AuthFailureError = exports.BadRequestError = exports.ConflictRequestError = exports.ErrorResponse = void 0;
const reasonPhrases_1 = require("./reasonPhrases");
const statusCodes_1 = require("./statusCodes");
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.ErrorResponse = ErrorResponse;
class ConflictRequestError extends ErrorResponse {
    constructor(message = reasonPhrases_1.ReasonPhrases.CONFLICT, statusCode = statusCodes_1.StatusCodes.CONFLICT) {
        super(message, statusCode);
    }
}
exports.ConflictRequestError = ConflictRequestError;
class BadRequestError extends ErrorResponse {
    constructor(message = reasonPhrases_1.ReasonPhrases.BAD_REQUEST, statusCode = statusCodes_1.StatusCodes.BAD_REQUEST) {
        super(message, statusCode);
    }
}
exports.BadRequestError = BadRequestError;
class AuthFailureError extends ErrorResponse {
    constructor(message = reasonPhrases_1.ReasonPhrases.UNAUTHORIZED, statusCode = statusCodes_1.StatusCodes.UNAUTHORIZED) {
        super(message, statusCode);
    }
}
exports.AuthFailureError = AuthFailureError;
class NotFoundError extends ErrorResponse {
    constructor(message = reasonPhrases_1.ReasonPhrases.NOT_FOUND, statusCode = statusCodes_1.StatusCodes.NOT_FOUND) {
        super(message, statusCode);
    }
}
exports.NotFoundError = NotFoundError;
class ForbiddenError extends ErrorResponse {
    constructor(message = reasonPhrases_1.ReasonPhrases.FORBIDDEN, statusCode = statusCodes_1.StatusCodes.FORBIDDEN) {
        super(message, statusCode);
    }
}
exports.ForbiddenError = ForbiddenError;
