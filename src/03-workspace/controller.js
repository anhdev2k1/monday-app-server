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
const success_response_1 = require("../root/responseHandler/success.response");
const catchAsync_1 = require("../root/utils/catchAsync");
const service_1 = __importDefault(require("./service"));
class WorkspaceController {
    constructor() {
        this.searchWorkspace = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const searchedWorkspace = yield service_1.default.searchWorkspace({
                keyString: req.params.keySearch,
            });
            new success_response_1.OK({
                message: 'Search successfully',
                metadata: {
                    workspaces: searchedWorkspace,
                },
            }).send(res);
        }));
        this.getAll = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const foundWorkspaces = yield service_1.default.getAllWorkspaces({
                userId: req.user._id,
                fields: '_id name description isMain',
                requestQuery: req.query,
            });
            new success_response_1.OK({
                message: 'Get list workspaces successfully',
                metadata: {
                    workspaces: foundWorkspaces,
                },
            }).send(res);
        }));
        this.getOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const foundWorkspace = yield service_1.default.getWorkspace({
                workspaceId: req.params.id,
            });
            new success_response_1.OK({
                message: 'Get workspace successfully',
                metadata: {
                    workspace: foundWorkspace,
                },
            }).send(res);
        }));
        this.createOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const createdNewWorkspace = yield service_1.default.createWorkspace({
                userId: req.user._id,
                data: req.body,
            });
            new success_response_1.CREATED({
                message: 'Create a new workspace successfully',
                metadata: {
                    workspace: createdNewWorkspace,
                },
            }).send(res);
        }));
        this.updateOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const updatedWorkspace = yield service_1.default.updateWorkspace({
                workspaceId: req.params.id,
                updationData: req.body,
            });
            new success_response_1.OK({
                message: 'Update workspace successfully',
                metadata: {
                    workspace: updatedWorkspace,
                },
            }).send(res);
        }));
        this.deleteOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            yield service_1.default.deleteWorkspace({ workspaceId: req.params.id });
            new success_response_1.OK({
                message: 'Delete workspace succesfully',
            }).send(res);
        }));
    }
}
const workspaceController = new WorkspaceController();
exports.default = workspaceController;
