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
const validator_1 = __importDefault(require("validator"));
const board_1 = __importDefault(require("../models/board"));
const column_1 = __importDefault(require("../models/column"));
const error_response_1 = require("../root/responseHandler/error.response");
const performTransaction_1 = require("../root/utils/performTransaction");
const type_1 = __importDefault(require("../models/type"));
class ColumnService {
    static getAllTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield type_1.default.find({}).lean();
        });
    }
    static createColumn({ boardId, userId, data, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(boardId))
                throw new error_response_1.BadRequestError(`Board Id: ${boardId} is invalid`);
            if (!(data.hasOwnProperty('belongType') && data.hasOwnProperty('position')))
                throw new error_response_1.BadRequestError('Missing some fields to create a new column');
            if (!validator_1.default.isMongoId(data.belongType))
                throw new error_response_1.BadRequestError(`Type Id: ${data.belongType} is invalid`);
            const insertPosition = data.position;
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                const foundBoardWithColumns = yield board_1.default.findById(boardId, {}, { session }).populate({
                    path: 'columns',
                    select: '_id position',
                    options: {
                        sort: { position: 1 },
                    },
                });
                if (!foundBoardWithColumns)
                    throw new error_response_1.NotFoundError('Board is not found');
                if (insertPosition > foundBoardWithColumns.columns.length)
                    throw new error_response_1.BadRequestError(`Invalid position ${insertPosition} to create a new column`);
                let updatingColumnPromises = [];
                const slicedColumns = foundBoardWithColumns.columns.slice(insertPosition);
                updatingColumnPromises = slicedColumns.map((column, index) => {
                    return column.updateOne({
                        $set: {
                            position: insertPosition + index + 1,
                        },
                    }, { new: true, session });
                });
                const creatingColumnPromise = column_1.default.createNewColumn({
                    boardDoc: foundBoardWithColumns,
                    typeId: data.belongType,
                    position: insertPosition,
                    userId: userId,
                    session,
                });
                updatingColumnPromises.unshift(creatingColumnPromise);
                const [createdNewColumn] = yield Promise.all(updatingColumnPromises);
                return createdNewColumn;
            }));
        });
    }
    static updateColumn({ columnId, updationData }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(columnId))
                throw new error_response_1.BadRequestError(`Column Id: ${columnId} is invalid`);
            if (updationData.belongType)
                throw new error_response_1.BadRequestError(`Column can't change type`);
            if (updationData.position)
                throw new error_response_1.BadRequestError(`Can't modify position of column`);
            const updatedColumn = yield column_1.default.findByIdAndUpdate(columnId, updationData, {
                new: true,
            }).lean();
            if (!updatedColumn)
                throw new error_response_1.NotFoundError('Column is not found');
            return updatedColumn;
        });
    }
    static updateAllColumns({ boardId, columns }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(boardId))
                throw new error_response_1.BadRequestError(`Board Id: ${boardId} is invalid`);
            const foundBoard = yield board_1.default.findById(boardId).lean();
            if (!foundBoard)
                throw new error_response_1.NotFoundError('Board is not found');
            if (foundBoard.columns.length !== columns.length)
                throw new error_response_1.BadRequestError('Please send all columns in a board to update all position of columns');
            const totalNumOfColumns = columns.length;
            const totalDesiredPosition = (totalNumOfColumns * (0 + totalNumOfColumns - 1)) / 2;
            const totalPosition = columns.reduce((currTotal, column) => currTotal + column.position, 0);
            if (totalDesiredPosition !== totalPosition)
                throw new error_response_1.BadRequestError('Something wrong when transmitted position of columns');
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                return yield column_1.default.updateAllColumns({
                    columns,
                    session,
                });
            }));
        });
    }
    static deleteColumn({ boardId, columnId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(boardId))
                throw new error_response_1.BadRequestError(`Board Id: ${boardId} is invalid`);
            const foundBoard = yield board_1.default.findById(boardId);
            if (!foundBoard)
                throw new error_response_1.NotFoundError('Board is not found');
            if (!validator_1.default.isMongoId(columnId))
                throw new error_response_1.BadRequestError(`Column Id: ${columnId} is invalid`);
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                yield column_1.default.deleteColumn({
                    boardDoc: foundBoard,
                    columnId,
                    session,
                });
            }));
        });
    }
}
exports.default = ColumnService;
