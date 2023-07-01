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
class BoardController {
    constructor() {
        this.searchBoards = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const foundBoards = yield service_1.default.searchBoards({ keyString: req.params.keySearch });
            new success_response_1.OK({
                message: 'Search board succesfully',
                metadata: {
                    boards: foundBoards,
                },
            }).send(res);
        }));
        this.getAll = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () { }));
        this.getOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const foundBoard = yield service_1.default.getBoard({ boardId: req.params.id });
            new success_response_1.OK({
                message: 'Get board successfully',
                metadata: {
                    board: foundBoard,
                },
            }).send(res);
        }));
        this.createOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const createdBoard = yield service_1.default.createBoard({
                workspaceId: req.params.workspaceId,
                userId: req.user._id,
                data: req.body,
            });
            new success_response_1.CREATED({
                message: 'Create a new Board successfully',
                metadata: {
                    board: createdBoard,
                },
            }).send(res);
        }));
        this.updateOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const updatedBoard = yield service_1.default.updateBoard({
                boardId: req.params.id,
                updationData: req.body,
            });
            new success_response_1.OK({
                message: 'Update board successfully',
                metadata: {
                    board: updatedBoard,
                },
            }).send(res);
        }));
        this.deleteOne = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            yield service_1.default.deleteBoard({
                workspaceId: req.params.workspaceId,
                boardId: req.params.id,
            });
            new success_response_1.OK({
                message: 'Delete board successfully',
                metadata: null,
            }).send(res);
        }));
    }
}
const boardController = new BoardController();
exports.default = boardController;
