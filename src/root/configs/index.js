"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oAuth2Client = exports.config = void 0;
const googleapis_1 = require("googleapis");
const dev = {
    app: {
        port: process.env.DEV_APP_PORT || 3001,
    },
    db: {
        name: process.env.DEV_DB_NAME || 'mondayDEV',
        password: process.env.DB_PASSWORD || 'qweqweqwe',
    },
    email: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI,
        refreshToken: process.env.REFRESH_TOKEN,
    },
};
const prod = {
    app: {
        port: process.env.PROD_APP_PORT || 3001,
    },
    db: {
        name: process.env.PROD_DB_NAME || 'mondayPROD',
        password: process.env.DB_PASSWORD || 'qweqweqwe',
    },
    email: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI,
        refreshToken: process.env.REFRESH_TOKEN,
    },
};
const configs = { dev, prod };
const env = process.env.NODE_ENV || 'dev';
const config = configs[env];
exports.config = config;
config.env = env;
const oAuth2Client = new googleapis_1.google.auth.OAuth2(config.email.clientId, config.email.clientSecret, config.email.redirectUri);
exports.oAuth2Client = oAuth2Client;
oAuth2Client.setCredentials({ refresh_token: config.email.refreshToken });
