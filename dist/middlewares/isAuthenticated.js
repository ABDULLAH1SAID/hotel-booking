"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const token_model_1 = require("../DB/models/token.model");
const user_model_1 = require("../DB/models/user.model");
const appError_1 = require("../utils/appError");
exports.isAuthenticated = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new appError_1.AppError("valid Token is required", 404));
    }
    // verfiy Token 
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
    if (!decoded) {
        return next(new appError_1.AppError("invalid token", 401));
    }
    const tokenDoc = await token_model_1.Token.findOne({ token, isValid: true, });
    if (!tokenDoc)
        return next(new appError_1.AppError("Token is invalid!", 401));
    const user = await user_model_1.User.findById(decoded.id);
    if (!user)
        return next(new appError_1.AppError("user not found", 404));
    req.user = user;
    next();
});
