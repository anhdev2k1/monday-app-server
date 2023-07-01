"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../02-authentication/middlewares/authenticate");
const route_1 = __importDefault(require("../02-authentication/route"));
const route_2 = __importDefault(require("../03-workspace/route"));
const route_3 = __importDefault(require("../04-board/route"));
const route_4 = __importDefault(require("../05-column/route"));
const route_5 = __importDefault(require("../06-group/route"));
const route_6 = __importDefault(require("../07-task/route"));
const route_7 = __importDefault(require("../08-value/route"));
const route_8 = __importDefault(require("../09-images/route"));
const router = (0, express_1.Router)();
//* Image
router.use('', route_8.default);
//* Authentication
router.use('/auth', route_1.default);
// router.use(authenticate as any);
router.use(authenticate_1.authenticateV2);
//* Workspace
router.use('', route_2.default);
//* Board
router.use('', route_3.default);
//* Column
router.use('', route_4.default);
//* Group
router.use('', route_5.default);
//* Task
router.use('', route_6.default);
//* Value
router.use('', route_7.default);
exports.default = router;
