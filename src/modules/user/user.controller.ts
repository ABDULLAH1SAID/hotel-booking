import { asyncHandler } from "../../utils/asyncHandler";
import {  Response, NextFunction } from "express";
import { User } from "../../DB/models/user.model";
import { AppError } from "../../utils/appError";
import { AuthenticatedRequest } from "../../types/isAuthenticate.interface"
import { updateProfileTypes } from "../../types/user.interface"


export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password -forgetCode");
    if (!user) return next(new AppError("user not found!", 404));
    res.status(200).json(user);
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const { userName, email, gender, phone}:updateProfileTypes = req.body
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            ...(userName && { userName }),
            ...(email && { email }),
            ...(gender && { gender }),
            ...(phone && { phone })
        },
        { new: true, runValidators: true }
    ).select("-password -forgetCode");

    res.status(200).json(updatedUser);
});
