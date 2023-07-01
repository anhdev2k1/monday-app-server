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
const group_1 = __importDefault(require("./group"));
const error_response_1 = require("../root/responseHandler/error.response");
const utils_1 = require("../root/utils");
const tasksColumns_1 = __importDefault(require("./tasksColumns"));
const board_1 = __importDefault(require("./board"));
const validator_1 = __importDefault(require("validator"));
const DOCUMENT_NAME = 'Task';
const COLLECTION_NAME = 'Tasks';
// Declare the Schema of the Mongo model
var taskSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    position: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    values: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'TasksColumns',
            },
        ],
        default: [],
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});
taskSchema.static('findByIdAndUpdatePosition', function findByIdAndUpdatePosition({ taskId, position, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const updatedTask = yield this.findByIdAndUpdate(taskId, {
            $set: {
                position: position,
            },
        }, { new: true, session });
        if (!updatedTask)
            throw new error_response_1.NotFoundError(`Task with ${taskId} is not found`);
        return updatedTask;
    });
});
taskSchema.static('createNewTask', function createNewTask({ boardId, groupDoc, data, session }) {
    return __awaiter(this, void 0, void 0, function* () {
        const foundBoard = yield board_1.default.findById(boardId, {}, { session })
            .populate({
            path: 'columns',
            select: '_id name position defaultValues',
            options: {
                sort: { position: 1 },
            },
            populate: {
                path: 'defaultValues',
                select: '_id value color canEditColor',
                match: {
                    canEditColor: false,
                },
            },
        })
            .lean();
        if (!foundBoard)
            throw new error_response_1.NotFoundError('Board is not found');
        const [createdNewTask] = (yield this.create([Object.assign({}, data)], {
            session,
        }));
        yield groupDoc.updateOne({
            $push: {
                tasks: createdNewTask._id,
            },
        }, { new: true, session });
        const createdNewTasksColumns = yield (0, utils_1.createSetOfTasksColumnsByTask)({
            columns: foundBoard.columns,
            taskDoc: createdNewTask,
            session,
        });
        const updatedTask = yield Task.findByIdAndUpdate(createdNewTask._id, {
            $set: {
                values: createdNewTasksColumns.map((tasksColumns) => tasksColumns._id),
            },
        }, { new: true, session });
        return yield updatedTask.populate({
            path: 'values',
            select: '_id value valueId belongColumn typeOfValue',
            populate: {
                path: 'valueId',
                select: '_id value color',
            },
        });
    });
});
taskSchema.static('updateAllPositionsInValue', function updateAllColumn({ changedPositions, desiredPositions, taskId, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const foundTask = yield this.findById(taskId);
        if (!foundTask)
            throw new error_response_1.NotFoundError('Task is not found');
        const values = foundTask.values;
        const changedPositionValues = changedPositions.map((changedPosition) => values[changedPosition]);
        desiredPositions.forEach((desiredPosition, index) => {
            values[desiredPosition] = changedPositionValues[index];
        });
        yield foundTask.updateOne({
            $set: {
                values: values,
            },
        }, { session });
    });
});
taskSchema.static('createNewTasks', function createNewTasks({ columns, selectedDefaultValues, session }) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get all values default of these columns
        const taskObjs = [
            { name: 'Task 1', position: 0, values: [] },
            { name: 'Task 2', position: 1, values: [] },
            { name: 'Task 1', position: 0, values: [] },
            { name: 'Task 2', position: 1, values: [] },
        ];
        const createdInsertTasks = (yield this.insertMany(taskObjs, {
            session,
        }));
        const updatingCreatedTasks = createdInsertTasks.map((task) => (0, utils_1.createSetOfTasksColumnsByTask1)({
            selectedDefaultValues,
            columns,
            taskDoc: task,
            session,
        }));
        const createdNewTasks = yield Promise.all(updatingCreatedTasks);
        return createdNewTasks;
    });
});
taskSchema.static('updateAllPositionTasks', function updateAllPositionTasks({ tasks, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const updatingAllTaskPromises = tasks.map((task, index) => this.findByIdAndUpdatePosition({ taskId: task._id, position: index, session }));
        return yield Promise.all(updatingAllTaskPromises);
    });
});
taskSchema.static('deleteTask', function deleteTask({ groupDoc, taskId, session }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!validator_1.default.isMongoId(taskId.toString()))
            throw new error_response_1.BadRequestError(`Task Id: ${taskId} is invalid`);
        const deletedTask = yield this.findByIdAndDelete(taskId, { session });
        if (!deletedTask)
            throw new error_response_1.NotFoundError('Task is not found');
        if (groupDoc) {
            yield groupDoc.updateOne({
                $pull: {
                    tasks: deletedTask._id,
                },
            }, { session });
            const foundAllTasksInGroup = yield this.find({
                _id: { $in: groupDoc.tasks },
            }, {}, { session }).sort({ position: 1 });
            const slicedTasks = foundAllTasksInGroup.slice(deletedTask.position);
            const updatingPositionAllTasksPromises = slicedTasks.map((task, index) => task.updateOne({
                $set: {
                    position: deletedTask.position + index,
                },
            }, { session }));
            yield Promise.all(updatingPositionAllTasksPromises);
        }
        yield tasksColumns_1.default.deleteMany({ _id: { $in: deletedTask.values } }, { session });
    });
});
taskSchema.static('deleteAllTasks', function deleteAllTasks({ groupId, session }) {
    return __awaiter(this, void 0, void 0, function* () {
        const foundGroup = yield group_1.default.findById(groupId, {}, { session });
        if (!foundGroup)
            throw new error_response_1.NotFoundError('Group is not found');
        const deletingTaskPromises = foundGroup.tasks.map((task) => this.deleteTask({ taskId: task, session }));
        yield Promise.all(deletingTaskPromises);
    });
});
//Export the model
const Task = db_1.default.model(DOCUMENT_NAME, taskSchema);
exports.default = Task;
