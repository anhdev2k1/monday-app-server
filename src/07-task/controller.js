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
class TaskController {
    constructor() {
        this.getAll = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () { }));
        this.getOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const foundTask = yield service_1.default.getTask({
                taskId: req.params.id,
            });
            new success_response_1.OK({
                message: 'Get task successfully',
                metadata: {
                    task: foundTask,
                },
            }).send(res);
        }));
        this.createOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const createdNewTask = yield service_1.default.createTask({
                boardId: req.params.boardId,
                groupId: req.params.groupId,
                data: req.body,
            });
            new success_response_1.CREATED({
                message: 'Create a new task successfully',
                metadata: {
                    task: createdNewTask,
                },
            }).send(res);
        }));
        this.updateOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const updatedTask = yield service_1.default.updateTask({
                taskId: req.params.id,
                updationData: req.body,
            });
            new success_response_1.OK({
                message: 'Update task successfully',
                metadata: {
                    task: updatedTask,
                },
            }).send(res);
        }));
        this.updateAllTasks = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { tasks } = req.body;
            if (!tasks)
                throw new error_response_1.BadRequestError('Invalid transmitted data');
            const updatedAllTasks = yield service_1.default.updateAllTasks({
                groupId: req.params.groupId,
                tasks,
            });
            new success_response_1.OK({
                message: 'Update all tasks successfully',
                metadata: {
                    tasks: updatedAllTasks,
                },
            }).send(res);
        }));
        this.deleteTasks = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { ids } = req.query;
            if (!ids)
                throw new error_response_1.BadRequestError('Missing some fields to delete tasks');
            const taskIds = ids.split(',');
            yield service_1.default.deleteTasks({
                groupId: req.params.groupId,
                taskIds,
            });
            new success_response_1.OK({
                message: 'Delete tasks successfully',
                metadata: null,
            }).send(res);
        }));
        this.deleteOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () { }));
        this.deleteAllTasksInGroup = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            yield service_1.default.deleteAllTasksInGroup({
                groupId: req.params.groupId,
            });
            new success_response_1.OK({
                message: 'Delete all tasks in group successfully',
                metadata: null,
            }).send(res);
        }));
    }
}
const taskController = new TaskController();
exports.default = taskController;
