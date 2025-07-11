"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoom = exports.updateRoom = exports.createRoom = void 0;
const Joi_1 = __importDefault(require("Joi"));
const room_interfaces_1 = require("../../types/room.interfaces");
const mongoose_1 = require("mongoose");
exports.createRoom = Joi_1.default.object({
    name: Joi_1.default.string().trim().min(3).max(100).required(),
    description: Joi_1.default.string().min(5).required(),
    pricePerNight: Joi_1.default.number().min(0).required(),
    capacity: Joi_1.default.number().min(1).required(),
    roomType: Joi_1.default.string().valid(...Object.values(room_interfaces_1.RoomType)).required(),
    amenities: Joi_1.default.array().items(Joi_1.default.string()).default([]),
    images: Joi_1.default.array().items(Joi_1.default.string().uri()).default([]),
    isAvailable: Joi_1.default.boolean().default(true),
}).required();
exports.updateRoom = Joi_1.default.object({
    id: Joi_1.default.string().custom(mongoose_1.isValidObjectId).required(),
    name: Joi_1.default.string().trim().min(3).max(100),
    description: Joi_1.default.string().min(5),
    pricePerNight: Joi_1.default.number().min(0),
    capacity: Joi_1.default.number().min(1),
    roomType: Joi_1.default.string().valid(...Object.values(room_interfaces_1.RoomType)),
    amenities: Joi_1.default.array(),
    images: Joi_1.default.array(),
    isAvailable: Joi_1.default.boolean(),
    imagesToDelete: Joi_1.default.alternatives().try(Joi_1.default.string(), Joi_1.default.array().items(Joi_1.default.string())).optional()
}).required();
exports.deleteRoom = Joi_1.default.object({
    id: Joi_1.default.string().custom(mongoose_1.isValidObjectId).required(),
}).required();
