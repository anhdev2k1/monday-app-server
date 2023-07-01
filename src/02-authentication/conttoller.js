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
const success_response_1 = require("../root/responseHandler/success.response");
const catchAsync_1 = require("../root/utils/catchAsync");
const service_1 = __importDefault(require("./service"));
class AcessController {
    constructor() {
        this.logout = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            new success_response_1.OK({
                message: 'Log out successfully',
                metadata: service_1.default.logout(res),
            }).send(res);
        }));
        this.signIn = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password)
                throw new error_response_1.BadRequestError('Missing some fields');
            new success_response_1.OK({
                message: 'Sign in successfully',
                metadata: yield service_1.default.signIn({ email, password }, res),
            }).send(res);
        }));
        this.verifyCode = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { email, code } = req.body;
            if (!email || !code)
                throw new error_response_1.BadRequestError('Missing some fields');
            new success_response_1.CREATED({
                message: 'Verify account successfully',
                metadata: yield service_1.default.verifyCode({ email, code }, res),
            }).send(res);
        }));
        this.sendCode = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            if (!email)
                throw new error_response_1.BadRequestError('Missing some fields');
            new success_response_1.OK({
                message: 'Send code again successfully',
                metadata: yield service_1.default.sendCodeAgain({ email }),
            }).send(res);
        }));
        this.signUp = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = req.body;
            if (!name || !email || !password)
                throw new error_response_1.BadRequestError('Missing some fields');
            new success_response_1.OK({
                message: 'Check code in your gmail',
                metadata: yield service_1.default.signUp({ name, email, password }, res),
            }).send(res);
        }));
        this.getMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            new success_response_1.OK({
                message: 'Get information successfully',
                metadata: yield service_1.default.getMe({ id: req.user._id }, res),
            }).send(res);
        }));
    }
}
const accessController = new AcessController();
exports.default = accessController;
