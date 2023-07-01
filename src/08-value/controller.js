"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../root/responseHandler/error.response");
const success_response_1 = require("../root/responseHandler/success.response");
const catchAsync_1 = require("../root/utils/catchAsync");
const service_1 = __importDefault(require("./service"));
class ValueController {
    constructor() {
        this.getOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () { }));
        this.getAll = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () { }));
        this.createOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const createdNewValue = yield service_1.default.createValueByType({
                boardId: req.params.boardId,
                columnId: req.params.columnId,
                data: req.body,
                userId: req.user._id,
            });
            new success_response_1.CREATED({
                message: 'Create a new value by type successfully',
                metadata: {
                    value: createdNewValue,
                },
            }).send(res);
        }));
        this.selectValue = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            if (!data.hasOwnProperty('value') || !data.hasOwnProperty('valueId')) {
                throw new error_response_1.BadRequestError('Missing some fields');
            }
            const selectedValue = yield service_1.default.selectValue({
                tasksColumnsId: req.params.id,
                value: req.body.value,
                valueId: req.body.valueId,
            });
            new success_response_1.OK({
                message: 'Update value at task and column successfully',
                metadata: {
                    value: selectedValue,
                },
            }).send(res);
        }));
        this.updateOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const updatedValue = yield service_1.default.updateValueByType({
                defaultValueId: req.params.id,
                updationData: req.body,
            });
            new success_response_1.OK({
                message: 'Update value by type successfully',
                metadata: {
                    value: updatedValue,
                },
            }).send(res);
        }));
        this.deleteOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            yield service_1.default.deleteValueByType({
                columnId: req.params.columnId,
                defaultValueId: req.params.id,
            });
            new success_response_1.OK({
                message: 'Delete a value by type successfully',
                metadata: null,
            }).send(res);
        }));
    }
}
const valueController = new ValueController();
exports.default = valueController;
