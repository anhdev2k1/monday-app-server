"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
const workspaceRouter = (0, express_1.Router)();
workspaceRouter
    .route('/workspace')
    .get(controller_1.default.getAll)
    .post(controller_1.default.createOne);
workspaceRouter
    .route('/workspace/:id')
    .get(controller_1.default.getOne)
    .patch(controller_1.default.updateOne)
    .delete(controller_1.default.deleteOne);
workspaceRouter.get('/search/:keySearch', controller_1.default.searchWorkspace);
exports.default = workspaceRouter;
