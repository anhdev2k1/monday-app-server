"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOCONTENT = exports.CREATED = exports.OK = exports.SuccessResponse = void 0;
const statusCodes_1 = require("./statusCodes");
const reasonPhrases_1 = require("./reasonPhrases");
class SuccessResponse {
    constructor({ message, statusCode = statusCodes_1.StatusCodes.OK, reasonStatusCode = reasonPhrases_1.ReasonPhrases.OK, metadata, }) {
        this.status = 'success';
        this.message = message !== null && message !== void 0 ? message : reasonStatusCode;
        this.statusCode = statusCode !== null && statusCode !== void 0 ? statusCode : statusCodes_1.StatusCodes.OK;
        this.metadata = metadata !== null && metadata !== void 0 ? metadata : {};
    }
    send(res, headers = {}) {
        return res.status(this.statusCode).json({
            message: this.message,
            status: this.status,
            statusCode: this.statusCode,
            metadata: this.metadata,
        });
    }
}
exports.SuccessResponse = SuccessResponse;
class OK extends SuccessResponse {
    constructor({ message, metadata }) {
        super({ message: message, metadata: metadata });
    }
}
exports.OK = OK;
class CREATED extends SuccessResponse {
    constructor({ message, statusCode = statusCodes_1.StatusCodes.CREATED, reasonStatusCode = reasonPhrases_1.ReasonPhrases.CREATED, metadata, }) {
        super({ message, statusCode, reasonStatusCode, metadata });
    }
}
exports.CREATED = CREATED;
class NOCONTENT extends SuccessResponse {
    constructor({ message, statusCode = statusCodes_1.StatusCodes.NO_CONTENT, reasonStatusCode = reasonPhrases_1.ReasonPhrases.NO_CONTENT, metadata, }) {
        super({ message, statusCode, reasonStatusCode, metadata });
    }
}
exports.NOCONTENT = NOCONTENT;
