"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const mongoose_1 = require("mongoose");
const tokenSchema = new mongoose_1.Schema({
    token: { type: String, required: true },
    user: { type: mongoose_1.Types.ObjectId, ref: "User" },
    isValid: { type: Boolean, default: true },
    agent: { type: String },
    expiredAt: { type: String }
}, { timestamps: true });
exports.Token = (0, mongoose_1.model)("Token", tokenSchema);
