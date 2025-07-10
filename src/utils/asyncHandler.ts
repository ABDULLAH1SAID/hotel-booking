import { Request, Response, NextFunction } from 'express';
export const asyncHandler = (controller: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        controller(req, res, next).catch((error: any) => next(error));
    };
};
