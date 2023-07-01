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
const group_1 = __importDefault(require("../models/group"));
const board_1 = __importDefault(require("../models/board"));
const validator_1 = __importDefault(require("validator"));
class GroupService {
    static createGroup({ boardId, data }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(boardId))
                throw new error_response_1.BadRequestError(`Board Id: ${boardId} is invalid`);
            if (!(data.hasOwnProperty('name') && data.hasOwnProperty('position')))
                throw new error_response_1.BadRequestError('Missing some fields to create a new group');
            const insertPosition = data.position;
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                const foundBoardWithGroups = yield board_1.default.findById(boardId, {}, { session }).populate({
                    path: 'groups',
                    select: '_id position',
                    options: {
                        sort: { position: 1 },
                    },
                });
                if (!foundBoardWithGroups)
                    throw new error_response_1.NotFoundError('Board is not found');
                if (insertPosition > foundBoardWithGroups.groups.length)
                    throw new error_response_1.BadRequestError(`Invalid position ${insertPosition} to create a new group`);
                let updatingGroupPromises = [];
                const slicedGroups = foundBoardWithGroups.groups.slice(insertPosition);
                updatingGroupPromises = slicedGroups.map((group, index) => {
                    return group.updateOne({
                        $set: {
                            position: insertPosition + index + 1,
                        },
                    }, { new: true, session });
                });
                const creatingNewGroupPromise = group_1.default.createNewGroup({
                    boardDoc: foundBoardWithGroups,
                    data,
                    session,
                });
                updatingGroupPromises.unshift(creatingNewGroupPromise);
                const [createdNewGroup] = yield Promise.all(updatingGroupPromises);
                return createdNewGroup;
            }));
        });
    }
    static updateGroup({ groupId, updationData, session = null }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(groupId))
                throw new error_response_1.BadRequestError(`Group Id: ${groupId} is invalid`);
            if (updationData.position)
                throw new error_response_1.BadRequestError(`Can't modify position of group`);
            const updatedGroup = yield group_1.default.findByIdAndUpdate(groupId, updationData, {
                new: true,
                session,
            }).lean();
            if (!updatedGroup)
                throw new error_response_1.NotFoundError('Group is not found');
            return updatedGroup;
        });
    }
    static updateAllGroups({ boardId, groups }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(boardId))
                throw new error_response_1.BadRequestError(`Board Id: ${boardId} is invalid`);
            const foundBoard = yield board_1.default.findById(boardId).lean();
            if (!foundBoard)
                throw new error_response_1.NotFoundError('Board is not found');
            if (foundBoard.groups.length !== groups.length)
                throw new error_response_1.BadRequestError('Please send all groups in a board to update all position of groups');
            const totalNumOfGroups = groups.length;
            const totalDesiredPosition = (totalNumOfGroups * (0 + totalNumOfGroups - 1)) / 2;
            const totalPosition = groups.reduce((currTotal, group) => currTotal + group.position, 0);
            if (totalDesiredPosition !== totalPosition)
                throw new error_response_1.BadRequestError('Something wrong when transmitted position of groups');
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                return yield group_1.default.updateAllPositionGroups({ groups, session });
            }));
        });
    }
    static deleteGroup({ boardId, groupId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isMongoId(boardId))
                throw new error_response_1.BadRequestError(`Board Id: ${boardId} is invalid`);
            const foundBoard = yield board_1.default.findById(boardId);
            if (!foundBoard)
                throw new error_response_1.NotFoundError('Board is not found');
            if (foundBoard.groups.length === 1)
                throw new error_response_1.BadRequestError('Board has to have at least one group');
            if (!validator_1.default.isMongoId(groupId))
                throw new error_response_1.BadRequestError(`Group Id: ${groupId} is invalid`);
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                yield group_1.default.deleteGroup({ boardDoc: foundBoard, groupId, session });
            }));
        });
    }
}
exports.default = GroupService;
