"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthorized = void 0;
const appError_1 = require("../utils/appError");
const isAuthorized = (...roles) => {
    return async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new appError_1.AppError("Not Authorized!", 403));
        }
        next();
    };
};
exports.isAuthorized = isAuthorized;
