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
const board_1 = __importDefault(require("../models/board"));
const defaultValue_1 = __importDefault(require("../models/defaultValue"));
const tasksColumns_1 = __importDefault(require("../models/tasksColumns"));
const error_response_1 = require("../root/responseHandler/error.response");
const performTransaction_1 = require("../root/utils/performTransaction");
const constant_1 = require("../05-column/constant");
const column_1 = __importDefault(require("../models/column"));
const validator_1 = require("../root/utils/validator");
const validator_2 = __importDefault(require("validator"));
class ValueService {
    static createValueByType({ boardId, columnId, userId, data }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_2.default.isMongoId(boardId))
                throw new error_response_1.BadRequestError(`Board Id: ${boardId} is invalid`);
            if (!validator_2.default.isMongoId(columnId))
                throw new error_response_1.BadRequestError(`Column Id: ${columnId} is invalid`);
            if (!(data.hasOwnProperty('value') && data.hasOwnProperty('color')))
                throw new error_response_1.BadRequestError('Missing some fields to create a new value');
            const foundBoard = yield board_1.default.findById(boardId);
            if (!foundBoard)
                throw new error_response_1.NotFoundError('Board is not found');
            const foundColumn = (yield column_1.default.findById(columnId).populate({
                path: 'belongType',
                select: '_id name',
            }));
            if (!foundColumn)
                throw new error_response_1.NotFoundError('Column is not found');
            if (Object.values(constant_1.SingleValueTypes).includes(foundColumn.belongType.name)) {
                throw new error_response_1.BadRequestError(`This type can not create more value`);
            }
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                const [createdNewValue] = yield defaultValue_1.default.create([
                    Object.assign(Object.assign({}, data), { belongBoard: boardId, belongType: foundColumn.belongType, createdBy: userId }),
                ], { session });
                yield foundColumn.updateOne({
                    $push: {
                        defaultValues: createdNewValue._id,
                    },
                }, { session });
                return createdNewValue;
            }));
        });
    }
    static updateValueByType({ defaultValueId, updationData }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_2.default.isMongoId(defaultValueId))
                throw new error_response_1.BadRequestError(`Value Id: ${defaultValueId} is invalid`);
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                const updatedValue = yield defaultValue_1.default.findByIdAndUpdate(defaultValueId, updationData, {
                    new: true,
                    session,
                }).lean();
                if (!updatedValue)
                    throw new error_response_1.NotFoundError('Value is not found');
                if (!updatedValue.canEditColor && updationData.color)
                    throw new error_response_1.BadRequestError(`This type can't edit color`);
                return updatedValue;
            }));
        });
    }
    static selectValue({ tasksColumnsId, value, valueId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_2.default.isMongoId(tasksColumnsId))
                throw new error_response_1.BadRequestError(`Value id of task: ${tasksColumnsId} is invalid`);
            const foundTasksColumns = yield tasksColumns_1.default.findById(tasksColumnsId);
            if (!foundTasksColumns)
                throw new error_response_1.NotFoundError('This box is not found');
            if (valueId) {
                if (foundTasksColumns.typeOfValue === 'single')
                    throw new error_response_1.BadRequestError('Invalid data transmitted');
                if (!validator_2.default.isMongoId(valueId))
                    throw new error_response_1.BadRequestError(`Value Id: ${valueId} is invalid`);
                const foundDefaultValue = yield defaultValue_1.default.findById(valueId).lean();
                if (!foundDefaultValue)
                    throw new error_response_1.NotFoundError(`Default value of ${valueId} is not found`);
                foundTasksColumns.valueId = foundDefaultValue._id;
                return yield foundTasksColumns.save();
            }
            if (foundTasksColumns.typeOfValue === 'multiple')
                throw new error_response_1.BadRequestError('Invalid data transmitted');
            const foundColumnWithType = (yield column_1.default.findById(foundTasksColumns.belongColumn)
                .populate({
                path: 'belongType',
                select: '_id name',
            })
                .lean());
            if (!foundColumnWithType)
                throw new error_response_1.NotFoundError('Column of this box is not found');
            const isValidType = (0, validator_1.checkValidType)(foundColumnWithType.belongType.name, value);
            if (!isValidType)
                throw new error_response_1.BadRequestError(`Value ${value} is incorrect format`);
            foundTasksColumns.value = value;
            return yield foundTasksColumns.save();
        });
    }
    static deleteValueByType({ columnId, defaultValueId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_2.default.isMongoId(defaultValueId))
                throw new error_response_1.BadRequestError(`Value Id: ${defaultValueId} is invalid`);
            if (!validator_2.default.isMongoId(columnId))
                throw new error_response_1.BadRequestError(`Column Id: ${columnId} is invalid`);
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                const deletedValue = yield defaultValue_1.default.findByIdAndDelete(defaultValueId, { session });
                if (!deletedValue)
                    throw new error_response_1.NotFoundError('Value is not found');
                if (!deletedValue.canEditColor)
                    throw new error_response_1.BadRequestError(`Default value of this type can't deleted`);
                const foundBoardWithColumns = yield board_1.default.findById(deletedValue.belongBoard).populate({
                    path: 'columns',
                    select: '_id',
                });
                const foundAllTasksColumnsInBoard = yield tasksColumns_1.default.find({
                    valueId: deletedValue._id,
                    belongColumn: { $in: foundBoardWithColumns === null || foundBoardWithColumns === void 0 ? void 0 : foundBoardWithColumns.columns },
                }, {}, { session });
                if (foundAllTasksColumnsInBoard.length !== 0)
                    throw new error_response_1.BadRequestError(`You can't delete value while in use`);
                const updatedColumn = yield column_1.default.findByIdAndUpdate(columnId, {
                    $pull: {
                        defaultValues: deletedValue._id,
                    },
                }, { session });
                if (!updatedColumn)
                    throw new error_response_1.NotFoundError(`Column is not found`);
            }));
        });
    }
}
exports.default = ValueService;
