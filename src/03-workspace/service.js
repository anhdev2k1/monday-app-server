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
const performTransaction_1 = require("../root/utils/performTransaction");
const queryTransform_1 = __importDefault(require("../root/utils/queryTransform"));
const workspace_1 = __importDefault(require("../models/workspace"));
const validator_1 = __importDefault(require("validator"));
class WorkspaceService {
    static searchWorkspace({ keyString }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield workspace_1.default.find({
                $text: {
                    $search: keyString,
                },
            }, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } })
                .lean();
            return results;
        });
    }
    static getMainWorkspace({ fields, userId }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield workspace_1.default.findOne({ isMain: true, createdBy: userId }).select(fields).lean();
        });
    }
    static getAllWorkspaces({ userId, fields, requestQuery }) {
        return __awaiter(this, void 0, void 0, function* () {
            const findingMainWorkspace = this.getMainWorkspace({
                fields,
                userId,
            });
            const workspaceQuery = new queryTransform_1.default(workspace_1.default.find({ createdBy: userId, isMain: false }), requestQuery)
                .filter()
                .sort()
                .limitFields(fields)
                .paginate(true);
            const findingWorkspaces = workspaceQuery.getQuery();
            const [foundMainWorkspace, foundWorkspaces] = yield Promise.all([
                findingMainWorkspace,
                findingWorkspaces,
            ]);
            return [foundMainWorkspace, ...foundWorkspaces];
        });
    }
    static getWorkspace({ workspaceId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(workspaceId))
                throw new error_response_1.BadRequestError(`Workspace Id: ${workspaceId} is invalid`);
            const foundWorkspace = yield workspace_1.default.findById(workspaceId)
                .populate({
                path: 'boards',
                select: '_id name isCreatedView belongWorkspace',
                options: {
                    sort: { updatedAt: -1 },
                    limit: 10,
                },
            })
                .lean();
            if (!foundWorkspace)
                throw new error_response_1.NotFoundError('Workspace is not found');
            return foundWorkspace;
        });
    }
    static createWorkspace({ userId, data }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.isMain)
                throw new error_response_1.BadRequestError(`Can't not create more main workspace`);
            if (!data.name)
                throw new error_response_1.BadRequestError('Missing name of workspace to create a new workspace');
            const createdNewWorkspace = yield workspace_1.default.create(Object.assign(Object.assign({}, data), { createdBy: userId._id }));
            return createdNewWorkspace;
        });
    }
    static updateWorkspace({ workspaceId, updationData }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(workspaceId))
                throw new error_response_1.BadRequestError(`Workspace Id: ${workspaceId} is invalid`);
            if (updationData.isMain)
                throw new error_response_1.BadRequestError(`Can't modify isMain property`);
            const updatedWorkspace = yield workspace_1.default.findByIdAndUpdate(workspaceId, updationData, {
                new: true,
            });
            if (!updatedWorkspace)
                throw new error_response_1.NotFoundError('Workspace is not found');
            return updatedWorkspace;
        });
    }
    static deleteWorkspace({ workspaceId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(workspaceId))
                throw new error_response_1.BadRequestError(`Workspace Id: ${workspaceId} is invalid`);
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                yield workspace_1.default.deleteWorkspace({ workspaceId, session });
            }));
        });
    }
}
exports.default = WorkspaceService;
