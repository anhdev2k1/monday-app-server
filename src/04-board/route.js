"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
const boardRouter = (0, express_1.Router)();
boardRouter.post('/workspace/:workspaceId/board', controller_1.default.createOne);
boardRouter
    .route('/board/:id')
    .get(controller_1.default.getOne)
    .patch(controller_1.default.updateOne);
boardRouter.delete('/workspace/:workspaceId/board/:id', controller_1.default.deleteOne);
boardRouter.get('/board/:keySearch', controller_1.default.searchBoards);
exports.default = boardRouter;
