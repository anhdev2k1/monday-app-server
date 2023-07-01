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
const mongoose_1 = require("mongoose");
const db_1 = __importDefault(require("../root/db"));
const type_1 = __importDefault(require("./type"));
const constant_1 = require("../05-column/constant");
const error_response_1 = require("../root/responseHandler/error.response");
const tasksColumns_1 = __importDefault(require("./tasksColumns"));
const defaultValue_1 = __importDefault(require("./defaultValue"));
const task_1 = __importDefault(require("./task"));
const validator_1 = __importDefault(require("validator"));
const DOCUMENT_NAME = 'Column';
const COLLECTION_NAME = 'Columns';
// Declare the Schema of the Mongo model
var columnSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    position: {
        type: Number,
        required: true,
    },
    belongType: {
        type: mongoose_1.Schema.Types.ObjectId,
        reuqired: true,
        ref: 'Type',
    },
    defaultValues: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'DefaultValue',
            },
        ],
        default: [],
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});
columnSchema.static('findByIdAndUpdatePosition', function findByIdAndUpdatePosition({ columnId, position, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const updatedColumn = yield this.findByIdAndUpdate(columnId, {
            $set: {
                position: position,
            },
        }, { new: true, session });
        if (!updatedColumn)
            throw new error_response_1.NotFoundError('Column is not found');
        return updatedColumn;
    });
});
columnSchema.static('createNewColumn', function createNewColumn({ boardDoc, typeId, userId, position, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const foundType = yield type_1.default.findById(typeId, {}, { session }).select('_id name icon color');
        if (!foundType)
            throw new error_response_1.NotFoundError('Type is not found');
        const createdNewDefaultValues = yield defaultValue_1.default.createNewDefaultValuesByColumn({
            boardId: boardDoc._id,
            typeDoc: foundType,
            createdBy: userId,
            session,
        });
        const [createdNewColumn] = yield this.create([
            {
                name: foundType.name,
                belongType: foundType._id,
                position,
                defaultValues: createdNewDefaultValues.map((value) => value._id),
            },
        ], { session });
        yield boardDoc.updateOne({
            $push: {
                columns: createdNewColumn._id,
            },
        }, { new: true, session });
        const tasksColumns = yield tasksColumns_1.default.createTasksColumnsByColumn({
            boardDoc: boardDoc,
            columnDoc: createdNewColumn,
            defaultValues: createdNewDefaultValues,
            position,
            session,
        });
        createdNewColumn.defaultValues = createdNewDefaultValues;
        createdNewColumn.belongType = foundType;
        return {
            createdNewColumn,
            tasksColumns,
        };
    });
});
columnSchema.static('createNewColumns', function createNewColumns({ boardId, userId, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const findingStatusType = type_1.default.findOne({ name: constant_1.MultipleValueTypes.STATUS });
        const findingDateType = type_1.default.findOne({ name: constant_1.SingleValueTypes.DATE });
        const foundTypes = yield Promise.all([findingStatusType, findingDateType]);
        const newColumnObjs = [];
        const selectedDefaultValue = [];
        for (const [index, type] of foundTypes.entries()) {
            const createdNewDefaultValues = yield defaultValue_1.default.createNewDefaultValuesByColumn({
                boardId: new mongoose_1.Types.ObjectId(boardId),
                typeDoc: type,
                createdBy: userId,
                session,
            });
            if (createdNewDefaultValues.length === 0) {
                selectedDefaultValue.push(null);
            }
            else {
                selectedDefaultValue.push(createdNewDefaultValues.at(-1));
            }
            newColumnObjs.push({
                name: type.name,
                position: index,
                belongType: type._id,
                defaultValues: createdNewDefaultValues.map((value) => value._id),
            });
        }
        const createdNewColumns = yield this.insertMany(newColumnObjs, { session });
        const gettingDefaultValuesFromColPromises = createdNewColumns.map((column) => column.populate([
            {
                path: 'belongType',
                select: '_id name color icon',
            },
            {
                path: 'defaultValues',
                select: '_id value color',
            },
        ]));
        const gotDefaultValuesFromColumns = yield Promise.all(gettingDefaultValuesFromColPromises);
        console.log({ gotDefaultValuesFromColumns });
        return {
            createdNewColumns: gotDefaultValuesFromColumns,
            selectedDefaultValues: selectedDefaultValue,
        };
    });
});
columnSchema.static('updateAllColumns', function updateAllColumns({ columns, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const changedPositions = [];
        const desiredPositions = [];
        const updatingAllColumnPromises = columns.map((column, index) => {
            if (!validator_1.default.isMongoId(column._id))
                throw new error_response_1.BadRequestError(`Column Id: ${column._id} is invalid`);
            if (index !== column.position) {
                changedPositions.push(column.position);
                desiredPositions.push(index);
            }
            return this.findByIdAndUpdatePosition({ columnId: column._id, position: index, session });
        });
        if (changedPositions.length === 0)
            throw new error_response_1.BadRequestError(`Position of columns is the same`);
        const updatedAllColumns = yield Promise.all(updatingAllColumnPromises);
        const foundAllTasksColumns = yield tasksColumns_1.default.find({
            belongColumn: { $in: updatedAllColumns[0]._id },
        }, {}, { session });
        const updatingValuesInTaskPromises = foundAllTasksColumns.map((tasksColumns) => task_1.default.updateAllPositionsInValue({
            changedPositions,
            desiredPositions,
            taskId: tasksColumns.belongTask,
            session,
        }));
        yield Promise.all(updatingValuesInTaskPromises);
        return updatedAllColumns;
    });
});
columnSchema.static('deleteColumn', function deleteColumn({ boardDoc, columnId, session }) {
    return __awaiter(this, void 0, void 0, function* () {
        const deletedColumn = yield this.findByIdAndDelete(columnId, { session });
        if (!deletedColumn)
            throw new error_response_1.NotFoundError('Column is not found');
        yield boardDoc.updateOne({
            $pull: {
                columns: deletedColumn._id,
            },
        }, { session });
        const foundAllColumnsInBoard = yield this.find({
            _id: { $in: boardDoc.columns },
        }, {}, { session }).sort({ position: 1 });
        const slicedColumns = foundAllColumnsInBoard.slice(deletedColumn.position);
        const updatingPositionAllColumnsPromises = slicedColumns.map((column, index) => column.updateOne({
            $set: {
                position: deletedColumn.position + index,
            },
        }, { session }));
        // Delete all default values of this column
        const deleteingDefaultValuesOfColumnPromise = defaultValue_1.default.deleteMany({ _id: { $in: deletedColumn.defaultValues } }, { session });
        // Delete all values in this column
        const findingTasksColumnsPromise = tasksColumns_1.default.find({
            belongColumn: { $in: deletedColumn._id },
        }, {}, { session });
        const [foundTasksColumns] = yield Promise.all([
            findingTasksColumnsPromise,
            deleteingDefaultValuesOfColumnPromise,
            ...updatingPositionAllColumnsPromises,
        ]);
        // Remove all tasksColumn id away from task
        const deleteingTasksColumnsPromises = foundTasksColumns.map((tasksColumns) => tasksColumns_1.default.deleteTasksColumnsByColumn({
            tasksColumnsDoc: tasksColumns,
            session,
        }));
        yield Promise.all(deleteingTasksColumnsPromises);
    });
});
//Export the model
const Column = db_1.default.model(DOCUMENT_NAME, columnSchema);
exports.default = Column;
