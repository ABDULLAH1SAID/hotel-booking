"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
const asyncHandler = (controller) => {
    return (req, res, next) => {
        controller(req, res, next).catch((error) => next(error));
    };
};
exports.asyncHandler = asyncHandler;
