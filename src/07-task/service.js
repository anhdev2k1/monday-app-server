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
const group_1 = __importDefault(require("../models/group"));
const task_1 = __importDefault(require("../models/task"));
const error_response_1 = require("../root/responseHandler/error.response");
const performTransaction_1 = require("../root/utils/performTransaction");
class TaskService {
    static getTask({ taskId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(taskId))
                throw new error_response_1.BadRequestError(`Task Id: ${taskId} is invalid`);
            const foundTask = yield task_1.default.findById(taskId).lean();
            if (!foundTask)
                throw new error_response_1.NotFoundError('Task is not found');
            return foundTask;
        });
    }
    static createTask({ boardId, groupId, data }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(boardId))
                throw new error_response_1.BadRequestError(`Board Id: ${boardId} is invalid`);
            if (!validator_1.default.isMongoId(groupId))
                throw new error_response_1.BadRequestError(`Group Id: ${groupId} is invalid`);
            if (!(data.hasOwnProperty('name') && data.hasOwnProperty('position')))
                throw new error_response_1.BadRequestError('Missing some fields to create a new task');
            const insertPosition = data.position;
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                const foundGroupWithTasks = yield group_1.default.findById(groupId, {}, { session }).populate({
                    path: 'tasks',
                    select: '_id position',
                    options: {
                        sort: { position: 1 },
                    },
                });
                if (!foundGroupWithTasks)
                    throw new error_response_1.NotFoundError('Group is not found');
                if (insertPosition > foundGroupWithTasks.tasks.length)
                    throw new error_response_1.BadRequestError(`Invalid position ${insertPosition} to create a new task`);
                let updatingTaskPromises = [];
                const slicedTasks = foundGroupWithTasks.tasks.slice(insertPosition);
                updatingTaskPromises = slicedTasks.map((task, index) => {
                    return task.updateOne({
                        $set: {
                            position: insertPosition + index + 1,
                        },
                    }, { new: true, session });
                });
                const creatingNewTaskPromise = task_1.default.createNewTask({
                    boardId,
                    groupDoc: foundGroupWithTasks,
                    data,
                    session,
                });
                updatingTaskPromises.unshift(creatingNewTaskPromise);
                const [createdNewTask] = yield Promise.all(updatingTaskPromises);
                return createdNewTask;
            }));
        });
    }
    static updateTask({ taskId, updationData }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(taskId))
                throw new error_response_1.BadRequestError(`Task Id: ${taskId} is invalid`);
            if (updationData.position)
                throw new error_response_1.BadRequestError(`Can't modify position of task`);
            const updatedTask = yield task_1.default.findByIdAndUpdate(taskId, updationData, { new: true }).lean();
            if (!updatedTask)
                throw new error_response_1.NotFoundError('Task is not found');
            return updatedTask;
        });
    }
    static updateAllTasks({ groupId, tasks }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(groupId))
                throw new error_response_1.BadRequestError(`Group Id: ${groupId} is invalid`);
            const foundGroup = yield group_1.default.findById(groupId);
            if (!foundGroup)
                throw new error_response_1.NotFoundError('Group is not found');
            if (foundGroup.tasks.length !== tasks.length)
                throw new error_response_1.BadRequestError('Please send all tasks in a board to update all position of tasks');
            const totalNumOfTasks = tasks.length;
            const totalDesiredPosition = (totalNumOfTasks * (0 + totalNumOfTasks - 1)) / 2;
            const totalPosition = tasks.reduce((currTotal, task) => currTotal + task.position, 0);
            if (totalDesiredPosition !== totalPosition)
                throw new error_response_1.BadRequestError('Something wrong when transmitted position of tasks');
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                return yield task_1.default.updateAllPositionTasks({ tasks, session });
            }));
        });
    }
    static deleteTasks({ groupId, taskIds }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(groupId))
                throw new error_response_1.BadRequestError(`Group Id: ${groupId} is invalid`);
            const foundGroup = yield group_1.default.findById(groupId);
            if (!foundGroup)
                throw new error_response_1.NotFoundError('Group is not found');
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                const deletingTaskPromises = taskIds.map((taskId) => task_1.default.deleteTask({ groupDoc: foundGroup, taskId, session }));
                yield Promise.all(deletingTaskPromises);
            }));
        });
    }
    static deleteAllTasksInGroup({ groupId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(groupId))
                throw new error_response_1.BadRequestError(`Group Id: ${groupId} is invalid`);
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                yield task_1.default.deleteAllTasks({ groupId, session });
            }));
        });
    }
}
exports.default = TaskService;
