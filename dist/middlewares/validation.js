"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = exports.isValidObjectId = void 0;
const mongoose_1 = require("mongoose");
const isValidObjectId = (value, helper) => {
    if (mongoose_1.Types.ObjectId.isValid(value))
        return true;
    return helper.message("Invalid ObjectId!");
};
exports.isValidObjectId = isValidObjectId;
const validation = (Schema) => {
    return (req, res, next) => {
        const data = { ...req.body, ...req.params, ...req.query };
        const validationResult = Schema.validate(data, { abortEarly: false });
        if (validationResult.error) {
            const errorMessage = validationResult.error.details.map((errorObj) => errorObj.message);
            const error = new Error(errorMessage.join(', '));
            error.cause = 400;
            return next(error);
        }
        return next();
    };
};
exports.validation = validation;
