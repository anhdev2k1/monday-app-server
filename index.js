"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./src/root/app"));
const index_1 = require("./src/root/configs/index");
const PORT = index_1.config.app.port;
app_1.default.listen(PORT, () => console.log(`Server is running on ${PORT}`));
