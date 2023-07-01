"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
const valueRouter = (0, express_1.Router)();
valueRouter.patch('/values/:id', controller_1.default.updateOne);
valueRouter.delete('/column/:columnId/values/:id', controller_1.default.deleteOne);
valueRouter
    .route('/board/:boardId/column/:columnId/values')
    .get(controller_1.default.getAll)
    .post(controller_1.default.createOne);
valueRouter.patch('/tasksColumns/:id', controller_1.default.selectValue);
exports.default = valueRouter;
