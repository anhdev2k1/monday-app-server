"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
const taskRouter = (0, express_1.Router)();
taskRouter.post('/board/:boardId/group/:groupId/task', controller_1.default.createOne);
taskRouter
    .route('/task/:id')
    .get(controller_1.default.getOne)
    .patch(controller_1.default.updateOne);
taskRouter
    .route('/group/:groupId/tasks')
    .patch(controller_1.default.updateAllTasks)
    .delete(controller_1.default.deleteTasks);
taskRouter.delete('/group/:groupId/alltasks', controller_1.default.deleteAllTasksInGroup);
exports.default = taskRouter;
