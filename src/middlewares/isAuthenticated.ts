import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import Jwt,{ JwtPayload } from "jsonwebtoken";
import { Token } from "../DB/models/token.model";
import { User } from "../DB/models/user.model";
import { AppError } from "../utils/appError";
import { AuthenticatedRequest } from "../types/isAuthenticate.interface"


    
export const isAuthenticated = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
            return next(new AppError("valid Token is required", 404));
        }
    // verfiy Token 
    const decoded = Jwt.verify(token, process.env.TOKEN_SECRET as string) as JwtPayload;
    if (!decoded) {
            return next(new AppError("invalid token", 401));
        }

    const tokenDoc = await Token.findOne({  token, isValid: true, });
    if (!tokenDoc) return next(new AppError ("Token is invalid!", 401));

    const user = await User.findById(decoded.id);

    if (!user) return next(new AppError("user not found", 404));
    req.user = user ;

    next()
})