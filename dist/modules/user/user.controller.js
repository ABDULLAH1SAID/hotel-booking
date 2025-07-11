"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const user_model_1 = require("../../DB/models/user.model");
const appError_1 = require("../../utils/appError");
exports.getProfile = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const user = await user_model_1.User.findById(userId).select("-password -forgetCode");
    if (!user)
        return next(new appError_1.AppError("user not found!", 404));
    res.status(200).json(user);
});
exports.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const { userName, email, gender, phone } = req.body;
    const updatedUser = await user_model_1.User.findByIdAndUpdate(userId, {
        ...(userName && { userName }),
        ...(email && { email }),
        ...(gender && { gender }),
        ...(phone && { phone })
    }, { new: true, runValidators: true }).select("-password -forgetCode");
    res.status(200).json(updatedUser);
});
