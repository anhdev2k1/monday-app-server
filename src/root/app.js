"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const configs_1 = require("./configs");
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const passport_1 = __importDefault(require("passport"));
const app_route_1 = __importDefault(require("./app.route"));
const passport_2 = require("../02-authentication/middlewares/passport");
const error_response_1 = require("./responseHandler/error.response");
const app = (0, express_1.default)();
//* Init middlewares
// Logger request HTTP method
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true,
    exposedHeaders: ['set-cookie'],
}));
if (configs_1.config.env === 'dev') {
    app.use((0, morgan_1.default)('dev'));
}
// Parse req.body
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, compression_1.default)());
(0, passport_2.applyPassportStrategy)(passport_1.default);
//* Init db
require("./db");
//* Init routes
app.use('/v1/api', app_route_1.default);
//* Handling error
app.all('*', (req, res, next) => {
    next(new error_response_1.NotFoundError(`Can't find ${req.originalUrl} on this server`));
});
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        status: 'error',
        statusCode,
        // stack: err.stack,
        message: err.message || 'Internal Server Error',
    });
});
exports.default = app;
