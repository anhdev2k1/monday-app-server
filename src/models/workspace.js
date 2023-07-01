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
const board_1 = __importDefault(require("./board"));
const error_response_1 = require("../root/responseHandler/error.response");
const DOCUMENT_NAME = 'Workspace';
const COLLECTION_NAME = 'Workspaces';
// Declare the Schema of the Mongo model
var workspaceSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    isMain: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    boards: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Board',
            },
        ],
        default: [],
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});
workspaceSchema.index({ name: 'text' });
workspaceSchema.static('deleteWorkspace', function deleteWorkspace({ workspaceId, session }) {
    return __awaiter(this, void 0, void 0, function* () {
        const deletedWorkspace = yield this.findByIdAndDelete(workspaceId, { session });
        if (!deletedWorkspace || deletedWorkspace.isMain)
            throw new error_response_1.BadRequestError('Workspace is not found or this workspace is main workspace');
        // Delete all boards
        const boardIds = deletedWorkspace.boards;
        const deleteBoardPromises = boardIds.map((boardId) => board_1.default.deleteBoard({ boardId, session }));
        yield Promise.all(deleteBoardPromises);
    });
});
//Export the model
const Workspace = db_1.default.model(DOCUMENT_NAME, workspaceSchema);
exports.default = Workspace;
