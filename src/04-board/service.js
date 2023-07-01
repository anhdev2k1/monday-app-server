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
const board_1 = __importDefault(require("../models/board"));
const workspace_1 = __importDefault(require("../models/workspace"));
const performTransaction_1 = require("../root/utils/performTransaction");
const validator_1 = __importDefault(require("validator"));
class BoardService {
    static searchBoards({ keyString }) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundBoards = yield board_1.default.find({
                $text: {
                    $search: keyString,
                },
            }, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } })
                .select('_id name')
                .lean();
            return foundBoards;
        });
    }
    static getBoard({ boardId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(boardId))
                throw new error_response_1.BadRequestError(`Board Id: ${boardId} is invalid`);
            const foundBoard = yield board_1.default.findById(boardId)
                .populate({
                path: 'columns',
                select: '_id name position belongType',
                options: {
                    sort: { position: 1 },
                },
                populate: [
                    {
                        path: 'belongType defaultValues',
                        select: '_id name icon color',
                    },
                    {
                        path: 'defaultValues',
                        select: '_id value color',
                    },
                ],
            })
                .populate({
                path: 'groups',
                select: '_id name position',
                options: {
                    sort: { position: 1 },
                },
                populate: {
                    path: 'tasks',
                    select: '_id name description position values',
                    options: {
                        sort: { position: 1 },
                    },
                    populate: {
                        path: 'values',
                        select: '_id value valueId typeOfValue belongColumn',
                        populate: {
                            path: 'valueId',
                            select: '_id value color',
                        },
                    },
                },
            })
                .lean();
            if (!foundBoard)
                throw new error_response_1.NotFoundError('Board is not found');
            return foundBoard;
        });
    }
    static createBoard({ workspaceId, userId, data }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(workspaceId))
                throw new error_response_1.BadRequestError(`Workspace Id: ${workspaceId} is invalid`);
            const foundWorkspace = yield workspace_1.default.findById(workspaceId);
            if (!foundWorkspace)
                throw new error_response_1.NotFoundError('Workspace is not exist');
            if (!data.hasOwnProperty('name'))
                throw new error_response_1.BadRequestError('Missing name field to create a new board');
            if (data.name.length === 0)
                throw new error_response_1.BadRequestError(`Name of board can't not be emptied`);
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                const createdNewBoard = yield board_1.default.createNewBoard({
                    workspaceDoc: foundWorkspace,
                    userId,
                    data,
                    session,
                });
                return createdNewBoard;
            }));
        });
    }
    static updateBoard({ boardId, updationData }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(boardId))
                throw new error_response_1.BadRequestError(`Board Id: ${boardId} is invalid`);
            if (updationData.hasOwnProperty('groups') || updationData.hasOwnProperty('columns'))
                throw new error_response_1.BadRequestError(`Can't not edit these fields: groups, columns`);
            const updatedBoard = yield board_1.default.findByIdAndUpdate(boardId, updationData, { new: true });
            if (!updatedBoard)
                throw new error_response_1.NotFoundError('Board is not found');
            return updatedBoard;
        });
    }
    static deleteBoard({ workspaceId, boardId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(workspaceId))
                throw new error_response_1.BadRequestError(`Workspace Id: ${workspaceId} is invalid`);
            if (!validator_1.default.isMongoId(boardId))
                throw new error_response_1.BadRequestError(`Board Id: ${boardId} is invalid`);
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                yield board_1.default.deleteBoard({ workspaceId, boardId, session });
            }));
        });
    }
}
exports.default = BoardService;
