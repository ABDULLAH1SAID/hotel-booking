"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBooking = exports.cancelBooking = exports.createBooking = void 0;
const Joi_1 = __importDefault(require("Joi"));
const validation_1 = require("../../middlewares/validation");
exports.createBooking = Joi_1.default.object({
    room: Joi_1.default.string().required(),
    checkInDate: Joi_1.default.date().required(),
    checkOutDate: Joi_1.default.date().required(),
});
exports.cancelBooking = Joi_1.default.object({
    id: Joi_1.default.string().custom(validation_1.isValidObjectId).required(),
}).required();
exports.updateBooking = Joi_1.default.object({
    id: Joi_1.default.string().custom(validation_1.isValidObjectId).required(),
    room: Joi_1.default.string().custom(validation_1.isValidObjectId).required(),
    checkInDate: Joi_1.default.date().required(),
    checkOutDate: Joi_1.default.date().required()
}).required();
