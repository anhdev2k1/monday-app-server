"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
const groupRouter = (0, express_1.Router)();
groupRouter.post('/board/:boardId/group', controller_1.default.createOne);
groupRouter.patch('/group/:id', controller_1.default.updateOne);
groupRouter.patch('/board/:boardId/allgroups', controller_1.default.updateAllGroups);
groupRouter.delete('/board/:boardId/group/:id', controller_1.default.deleteOne);
exports.default = groupRouter;
