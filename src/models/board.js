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
const column_1 = __importDefault(require("./column"));
const error_response_1 = require("../root/responseHandler/error.response");
const group_1 = __importDefault(require("./group"));
const utils_1 = require("../root/utils");
const workspace_1 = __importDefault(require("./workspace"));
const defaultValue_1 = __importDefault(require("./defaultValue"));
const DOCUMENT_NAME = 'Board';
const COLLECTION_NAME = 'Boards';
// Declare the Schema of the Mongo model
var boardSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    isCreatedView: {
        type: Boolean,
    },
    belongWorkspace: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Workspace',
    },
    groups: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Group',
            },
        ],
        default: [],
    },
    columns: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Column',
            },
        ],
        default: [],
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});
boardSchema.index({ name: 'text' });
boardSchema.static('createNewBoard', function createNewBoard({ workspaceDoc, userId, data, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const [createdNewBoard] = yield this.insertMany([
            Object.assign(Object.assign({}, data), { belongWorkspace: workspaceDoc._id }),
        ], { session });
        yield workspaceDoc.updateOne({
            $push: {
                boards: createdNewBoard._id,
            },
        }, { session });
        // Create new 2 columns, 2 groups and each group will create 2 new task with default values of 2 created columns
        const { createdNewColumns, selectedDefaultValues } = yield column_1.default.createNewColumns({
            boardId: createdNewBoard._id,
            userId,
            session,
        });
        const createdNewGroups = yield group_1.default.createNewGroups({
            columns: createdNewColumns,
            selectedDefaultValues,
            session,
        });
        yield createdNewBoard.updateOne({
            $push: {
                columns: { $each: createdNewColumns.map((column) => column._id) },
                groups: { $each: createdNewGroups.map((group) => group._id) },
            },
        });
        return Object.assign(Object.assign({}, createdNewBoard.toObject()), { columns: (0, utils_1.convertToArrObj)({
                fields: ['_id', 'name', 'position', 'belongType', 'defaultValues'],
                objects: createdNewColumns,
            }), groups: (0, utils_1.convertToArrObj)({
                fields: ['_id', 'name', 'position', 'tasks'],
                objects: createdNewGroups,
            }) });
    });
});
boardSchema.static('deleteBoard', function deleteBoard({ workspaceId, boardId, session }) {
    return __awaiter(this, void 0, void 0, function* () {
        const deletedBoard = yield this.findByIdAndDelete(boardId, { session });
        if (!deletedBoard)
            throw new error_response_1.NotFoundError('Board is not found');
        if (workspaceId) {
            const updatedWorkspace = yield workspace_1.default.findByIdAndUpdate(workspaceId, {
                $pull: {
                    boards: deletedBoard._id,
                },
            }, { session });
            if (!updatedWorkspace)
                throw new error_response_1.NotFoundError('Workspace is not found');
        }
        // Delete all columns and groups for each board
        const deleteColumnsPromise = column_1.default.deleteMany({ _id: { $in: deletedBoard.columns } }, { session });
        const deleteGroupPromises = deletedBoard.groups.map((groupId) => group_1.default.deleteGroup({ groupId, session }));
        const deleteAllDefaultValue = defaultValue_1.default.deleteMany({ belongBoard: deletedBoard._id }, { session });
        yield Promise.all([...deleteGroupPromises, deleteColumnsPromise, deleteAllDefaultValue]);
    });
});
//Export the model
const Board = db_1.default.model(DOCUMENT_NAME, boardSchema);
exports.default = Board;
