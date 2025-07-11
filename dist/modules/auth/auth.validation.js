"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgetCode = exports.login = exports.activateAccount = exports.register = void 0;
const Joi_1 = __importDefault(require("Joi"));
exports.register = Joi_1.default.object({
    userName: Joi_1.default.string().min(3).max(20).required(),
    email: Joi_1.default.string().email().required(),
    password: Joi_1.default.string().required(),
    confirmPassword: Joi_1.default.string().valid(Joi_1.default.ref('password')).required()
}).required();
exports.activateAccount = Joi_1.default.object({
    token: Joi_1.default.string().required()
}).required();
exports.login = Joi_1.default.object({
    email: Joi_1.default.string().email().required(),
    password: Joi_1.default.string().required()
}).required();
exports.forgetCode = Joi_1.default.object({
    email: Joi_1.default.string().email().required(),
}).required();
exports.resetPassword = Joi_1.default.object({
    email: Joi_1.default.string().email().required(),
    forgetCode: Joi_1.default.string().length(6).required(),
    password: Joi_1.default.string().required(),
    confirmPassword: Joi_1.default.string().valid(Joi_1.default.ref("password")).required(),
}).required();
