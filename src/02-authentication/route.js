"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const conttoller_1 = __importDefault(require("./conttoller"));
const authenticate_1 = require("./middlewares/authenticate");
const accessRouter = (0, express_1.Router)();
accessRouter.post('/signin', conttoller_1.default.signIn);
accessRouter.post('/signup', conttoller_1.default.signUp);
accessRouter.post('/verify', conttoller_1.default.verifyCode);
accessRouter.post('/sendCode', conttoller_1.default.sendCode);
accessRouter.use(authenticate_1.authenticateV2);
accessRouter.get('/me', conttoller_1.default.getMe);
accessRouter.post('/logout', conttoller_1.default.logout);
exports.default = accessRouter;
