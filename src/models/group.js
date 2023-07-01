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
const mongoose_1 = require("mongoose");
const db_1 = __importDefault(require("../root/db"));
const error_response_1 = require("../root/responseHandler/error.response");
const task_1 = __importDefault(require("./task"));
const validator_1 = __importDefault(require("validator"));
const DOCUMENT_NAME = 'Group';
const COLLECTION_NAME = 'Groups';
// Declare the Schema of the Mongo model
var groupSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    position: {
        type: Number,
        required: true,
    },
    tasks: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Task',
            },
        ],
        default: [],
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});
groupSchema.static('createNewGroup', function createNewGroup({ boardDoc, data, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const [createdNewGroup] = yield this.create([Object.assign({}, data)], { session });
        yield boardDoc.updateOne({
            $push: {
                groups: createdNewGroup._id,
            },
        }, { new: true, session });
        return createdNewGroup;
    });
});
groupSchema.static('createNewGroups', function createNewGroups({ columns, selectedDefaultValues, session }) {
    return __awaiter(this, void 0, void 0, function* () {
        //Create two new tasks and new values of these task with columns
        let groupObjs = [];
        const tasksPerGroup = 2;
        const createdNewTasks = yield task_1.default.createNewTasks({ columns, selectedDefaultValues, session });
        for (let i = 0; i < createdNewTasks.length; i += tasksPerGroup) {
            const tasksSlice = createdNewTasks.slice(i, i + tasksPerGroup);
            const group = {
                name: `New Group`,
                position: i / tasksPerGroup,
                tasks: tasksSlice.map((task) => task._id),
            };
            groupObjs.push(group);
        }
        const createdNewGroups = (yield this.insertMany(groupObjs, {
            session,
        }));
        const groupPromises = createdNewGroups.map((group) => group.populate({
            path: 'tasks',
            select: '_id name description position values',
            populate: {
                path: 'values',
                select: '_id value valueId typeOfValue belongColumn',
                populate: {
                    path: 'valueId',
                    select: '_id value color',
                },
            },
        }));
        return yield Promise.all(groupPromises);
    });
});
groupSchema.static('findByIdAndUpdatePosition', function findByIdAndUpdatePosition({ groupId, position, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const updatedGroup = yield this.findByIdAndUpdate(groupId, {
            $set: {
                position: position,
            },
        }, { new: true, session });
        if (!updatedGroup)
            throw new error_response_1.NotFoundError(`Group with id: ${groupId} is not found`);
        return updatedGroup;
    });
});
groupSchema.static('updateAllPositionGroups', function updateAllPositionGroups({ groups, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const updatingGroupPromises = groups.map((group, index) => {
            if (!validator_1.default.isMongoId(group._id.toString()))
                throw new error_response_1.BadRequestError(`Group Id: ${group._id} is invalid`);
            return this.findByIdAndUpdatePosition({
                groupId: group._id,
                position: index,
                session,
            });
        });
        return yield Promise.all(updatingGroupPromises);
    });
});
groupSchema.static('deleteGroup', function deleteGroup({ boardDoc, groupId, session }) {
    return __awaiter(this, void 0, void 0, function* () {
        const deletedGroup = yield this.findByIdAndDelete(groupId, { session });
        if (!deletedGroup)
            throw new error_response_1.NotFoundError('Group is not found');
        // Delete all tasks and values of each task in this group
        if (boardDoc) {
            yield boardDoc.updateOne({
                $pull: {
                    groups: deletedGroup._id,
                },
            }, { session });
            const foundAllGroupsInBoard = yield this.find({
                _id: { $in: boardDoc.groups },
            }, {}, { session }).sort({ position: 1 });
            const slicedGroups = foundAllGroupsInBoard.slice(deletedGroup.position);
            const updatingPositionAllGroupsPromises = slicedGroups.map((group, index) => group.updateOne({
                $set: {
                    position: deletedGroup.position + index,
                },
            }, { session }));
            yield Promise.all(updatingPositionAllGroupsPromises);
        }
        const deleteTaskPromises = deletedGroup.tasks.map((task) => task_1.default.deleteTask({ taskId: task._id, session }));
        yield Promise.all(deleteTaskPromises);
    });
});
//Export the model
const Group = db_1.default.model(DOCUMENT_NAME, groupSchema);
exports.default = Group;
