"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgetCode = exports.login = exports.activateAccount = exports.register = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const user_model_1 = require("../../DB/models/user.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../../utils/sendEmail");
const token_model_1 = require("../../DB/models/token.model");
const htmlTemplets_1 = require("../../utils/htmlTemplets");
const appError_1 = require("../../utils/appError");
const randomstring_1 = __importDefault(require("randomstring"));
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { userName, email, password, confirmPassword } = req.body;
    if (!userName || !email || !password || !confirmPassword) {
        return next(new appError_1.AppError("All fields are required", 400));
    }
    if (password !== confirmPassword) {
        return next(new appError_1.AppError("Passwords do not match", 400));
    }
    const existingUser = await user_model_1.User.findOne({ email });
    if (existingUser) {
        return next(new appError_1.AppError("email already exsist", 409));
    }
    const token = jsonwebtoken_1.default.sign({ email }, process.env.TOKEN_SECRET);
    await user_model_1.User.create({
        userName,
        email,
        password,
    });
    const confirmationlink = `http://localhost:3000/auth/activate_account/${token}`;
    const messageSent = await (0, sendEmail_1.sendEmail)({ to: email, subject: "Activated Account", html: (0, htmlTemplets_1.signUpTemplate)(confirmationlink) });
    if (!messageSent)
        return next(new appError_1.AppError("something went wrong!", 500));
    return res.status(201).json({
        success: true,
        message: 'Check your email!',
    });
});
exports.activateAccount = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { token } = req.params;
    const { email } = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
    const user = await user_model_1.User.findOneAndUpdate({ email }, { isConfirmed: true });
    if (!user) {
        return next(new appError_1.AppError("User not found", 404));
    }
    return res.status(201).json({ success: true, message: "try to login!" });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await user_model_1.User.findOne({ email });
    if (!user)
        return next(new appError_1.AppError("invalid email!", 403));
    if (!user.isConfirmed)
        return next(new appError_1.AppError("You should activate your account!", 403));
    const match = bcrypt_1.default.compareSync(password, user.password);
    console.log(match);
    if (!match)
        return next(new appError_1.AppError("Invalid Password!", 401));
    const token = jsonwebtoken_1.default.sign({ email, id: user._id }, process.env.TOKEN_SECRET);
    await token_model_1.Token.create({ token, user: user._id });
    return res.json({ success: true, results: token });
});
exports.forgetCode = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { email } = req.body;
    const user = await user_model_1.User.findOne({ email });
    if (!user)
        return next(new appError_1.AppError("Invalid Email!", 401));
    const forgetCode = randomstring_1.default.generate({
        length: 6,
        charset: 'numeric'
    });
    user.forgetCode = forgetCode;
    await user.save();
    const messageSent = await (0, sendEmail_1.sendEmail)({
        to: email,
        subject: "Reset Password",
        html: (0, htmlTemplets_1.resetPasswordTemplate)(forgetCode),
    });
    if (!messageSent)
        return next(new appError_1.AppError("Something went wrong!", 401));
    return res.json({ success: true, message: "Check your email!" });
});
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { email, password, forgetCode } = req.body;
    const user = await user_model_1.User.findOne({ email });
    if (!user)
        return next(new appError_1.AppError("Invalid Email!", 401));
    if (!user.isConfirmed)
        return next(new appError_1.AppError("Activate your account first!", 403));
    if (forgetCode !== user.forgetCode)
        return next(new appError_1.AppError("Code is invalid!!", 401));
    user.password = bcrypt_1.default.hashSync(password, parseInt(process.env.SALT_ROUND));
    await user.save();
    const tokens = await token_model_1.Token.find({ user: user._id });
    tokens.forEach(async (token) => {
        token.isValid = false;
        await token.save();
    });
    return res.json({ success: true, message: "Password updated successfully, please login again!" });
});
