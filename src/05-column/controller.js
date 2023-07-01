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
class ColumnController {
    constructor() {
        this.getOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () { }));
        this.getAllTypes = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const foundAllTypes = yield service_1.default.getAllTypes();
            new success_response_1.OK({
                message: 'Get all types successfully',
                metadata: {
                    types: foundAllTypes,
                },
            }).send(res);
        }));
        this.createOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { createdNewColumn, tasksColumns } = yield service_1.default.createColumn({
                boardId: req.params.boardId,
                userId: req.user._id,
                data: req.body,
            });
            new success_response_1.CREATED({
                message: 'Create a new column successfully',
                metadata: {
                    column: createdNewColumn,
                    tasksColumns,
                },
            }).send(res);
        }));
        this.updateOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const updatedColumn = yield service_1.default.updateColumn({
                columnId: req.params.id,
                updationData: req.body,
            });
            new success_response_1.OK({
                message: 'Update column successfully',
                metadata: {
                    column: updatedColumn,
                },
            }).send(res);
        }));
        this.updateAllColumns = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { columns } = req.body;
            if (!columns)
                throw new error_response_1.BadRequestError('Invalid transmitted data');
            const updatedAllColumns = yield service_1.default.updateAllColumns({
                boardId: req.params.boardId,
                columns,
            });
            new success_response_1.OK({
                message: 'Update all columns successfully',
                metadata: {
                    columns: updatedAllColumns,
                },
            }).send(res);
        }));
        this.deleteOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            yield service_1.default.deleteColumn({
                columnId: req.params.id,
                boardId: req.params.boardId,
            });
            new success_response_1.OK({
                message: 'Delete a column succesfully',
                metadata: null,
            }).send(res);
        }));
    }
}
const columnController = new ColumnController();
exports.default = columnController;
