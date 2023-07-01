"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkValidType = void 0;
const constant_1 = require("../../05-column/constant");
const validator_1 = __importDefault(require("validator"));
const error_response_1 = require("../responseHandler/error.response");
const checkValidType = (type, input) => {
    if (input.length === 0)
        return true;
    switch (type) {
        case constant_1.SingleValueTypes.DATE:
            return validator_1.default.isDate(input);
        case constant_1.SingleValueTypes.NUMBER:
            return validator_1.default.isNumeric(input);
        case constant_1.SingleValueTypes.TEXT:
            return validator_1.default.isAlphanumeric(input);
        default:
            throw new error_response_1.BadRequestError(`Invalid type: ${type}`);
    }
};
exports.checkValidType = checkValidType;
