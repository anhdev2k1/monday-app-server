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
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const express_1 = require("express");
const error_response_1 = require("../root/responseHandler/error.response");
const catchAsync_1 = require("../root/utils/catchAsync");
const imageRouter = (0, express_1.Router)();
imageRouter.get('/images/:imageName', (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const imageName = req.params.imageName;
    const imageDir = path_1.default.resolve(__dirname, '../asset/icons');
    let filePath;
    if (imageName.endsWith('.svg')) {
        filePath = path_1.default.join(imageDir, imageName);
    }
    else {
        filePath = path_1.default.join(imageDir, `${imageName}.svg`);
    }
    if ((0, fs_1.existsSync)(filePath)) {
        res.contentType('image/svg+xml');
        const svgStream = (0, fs_1.createReadStream)(filePath);
        svgStream.pipe(res);
        return;
    }
    if (imageName.endsWith('.png')) {
        filePath = path_1.default.join(imageDir, imageName);
    }
    else {
        filePath = path_1.default.join(imageDir, `${imageName}.png`);
    }
    if ((0, fs_1.existsSync)(filePath)) {
        res.contentType('image/png');
        const svgStream = (0, fs_1.createReadStream)(filePath);
        svgStream.pipe(res);
        return;
    }
    throw new error_response_1.BadRequestError('Image is not found');
})));
exports.default = imageRouter;
