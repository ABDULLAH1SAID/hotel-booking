import { Types } from "mongoose";
import { Request, Response, NextFunction } from "express";
import Joi, { Schema as JoiSchema, ValidationResult, ValidationErrorItem } from "joi";

export const isValidObjectId = (value: any, helper: any) => {
    if (Types.ObjectId.isValid(value)) return true;
    return helper.message("Invalid ObjectId!");
};

export const validation = (Schema: JoiSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const data = { ...req.body, ...req.params, ...req.query };
        const validationResult: ValidationResult = Schema.validate(data, { abortEarly: false });

        if (validationResult.error) {
            const errorMessage = validationResult.error.details.map(
                (errorObj: ValidationErrorItem) => errorObj.message
            );

            const error = new Error(errorMessage.join(', '));
            (error as any).cause = 400;
            return next(error);
        }

        return next();
    };
};
