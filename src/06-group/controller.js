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
exports.groupController = void 0;
const error_response_1 = require("../root/responseHandler/error.response");
const success_response_1 = require("../root/responseHandler/success.response");
const catchAsync_1 = require("../root/utils/catchAsync");
const service_1 = __importDefault(require("./service"));
class GroupController {
    constructor() {
        this.createOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const createdNewGroup = yield service_1.default.createGroup({
                boardId: req.params.boardId,
                data: req.body,
            });
            new success_response_1.CREATED({
                message: 'Create a new group successfully',
                metadata: {
                    group: createdNewGroup,
                },
            }).send(res);
        }));
        this.updateOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const updatedGroup = yield service_1.default.updateGroup({
                groupId: req.params.id,
                updationData: req.body,
            });
            new success_response_1.OK({
                message: 'Update group successfully',
                metadata: {
                    group: updatedGroup,
                },
            }).send(res);
        }));
        this.updateAllGroups = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { groups } = req.body;
            if (!groups)
                throw new error_response_1.BadRequestError('Invalid transmitted data');
            const updatedAllGroups = yield service_1.default.updateAllGroups({
                boardId: req.params.boardId,
                groups,
            });
            new success_response_1.OK({
                message: 'Update all groups successfully',
                metadata: {
                    groups: updatedAllGroups,
                },
            }).send(res);
        }));
        this.deleteOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            yield service_1.default.deleteGroup({
                boardId: req.params.boardId,
                groupId: req.params.id,
            });
            new success_response_1.OK({
                message: 'Delete group successfully',
                metadata: null,
            }).send(res);
        }));
    }
}
exports.groupController = new GroupController();
exports.default = exports.groupController;
