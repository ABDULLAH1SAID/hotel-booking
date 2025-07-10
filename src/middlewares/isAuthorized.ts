import { Request,Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { AuthenticatedRequest } from "../types/isAuthenticate.interface";
import { Role } from "../types/isAuthenticate.interface";

export const isAuthorized = (...roles:Role[]) => {
    return async (req: AuthenticatedRequest, res: Response, next:NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("Not Authorized!", 403 ));
        }
        next();
    };
};