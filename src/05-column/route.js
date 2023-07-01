"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
const columnRouter = (0, express_1.Router)();
columnRouter.get('/column/types', controller_1.default.getAllTypes);
columnRouter.post('/board/:boardId/column', controller_1.default.createOne);
columnRouter.patch('/board/:boardId/allcolumns', controller_1.default.updateAllColumns);
columnRouter.delete('/board/:boardId/column/:id', controller_1.default.deleteOne);
columnRouter.route('/column/:id').patch(controller_1.default.updateOne);
exports.default = columnRouter;
