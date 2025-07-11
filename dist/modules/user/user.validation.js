"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = void 0;
const Joi_1 = __importDefault(require("Joi"));
exports.updateProfile = Joi_1.default.object({
    userName: Joi_1.default.string().min(3).max(20),
    email: Joi_1.default.string().email(),
    gender: Joi_1.default.string().valid("male", "female"),
    phone: Joi_1.default.string().pattern(/^[0-9]{10,15}$/)
});
