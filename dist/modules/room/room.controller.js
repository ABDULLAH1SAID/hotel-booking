"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoom = exports.updateRoom = exports.getRooms = exports.createRoom = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const appError_1 = require("../../utils/appError");
const cloudUpload_1 = __importDefault(require("../../utils/cloudUpload"));
const room_model_1 = require("../../DB/models/room.model");
exports.createRoom = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { name, description, pricePerNight, roomType, capacity, amenities, isAvailable } = req.body;
    let images = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
            try {
                const { public_id, secure_url } = await cloudUpload_1.default.uploader.upload(file.path, {
                    folder: `${process.env.CLOUD_FOLDER_NAME}/room/photos`
                });
                images.push({
                    url: secure_url,
                    id: public_id
                });
            }
            catch (erro) {
                return next(new appError_1.AppError("Failed to upload image", 500));
            }
            ;
        }
    }
    const newRoom = await room_model_1.Room.create({
        name,
        description,
        pricePerNight,
        roomType,
        capacity,
        amenities,
        isAvailable,
        images,
    });
    res.status(201).json({
        success: true,
        message: "Room created successfully",
        data: newRoom,
    });
});
exports.getRooms = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 4);
    const filters = {};
    if (req.query.roomType) {
        filters.roomType = req.query.roomType;
    }
    if (req.query.minPrice) {
        const minPrice = parseFloat(req.query.minPrice);
        if (!isNaN(minPrice)) {
            filters.pricePerNight = { ...filters.pricePerNight, $gte: minPrice };
        }
    }
    if (req.query.maxPrice) {
        const maxPrice = parseFloat(req.query.maxPrice);
        if (!isNaN(maxPrice)) {
            filters.pricePerNight = { ...filters.pricePerNight, $lte: maxPrice };
        }
    }
    if (req.query.isAvailable !== undefined) {
        filters.isAvailable = req.query.isAvailable === 'true';
    }
    const rooms = await room_model_1.Room.find(filters)
        .sort({ createdAt: -1 });
    // .paginate(page, limit);
    const totalRooms = await room_model_1.Room.countDocuments(filters);
    const totalPages = Math.ceil(totalRooms / limit);
    res.status(200).json({
        success: true,
        currentPage: page,
        totalPages,
        totalRooms,
        roomsInPage: rooms.length,
        data: rooms,
    });
});
exports.updateRoom = (async (req, res, next) => {
    const roomId = req.params.id;
    const room = await room_model_1.Room.findById(roomId);
    if (!room)
        return next(new appError_1.AppError("Room not found", 404));
    console.log(req.body.imagesToDelete);
    if (req.body.imagesToDelete && Array.isArray(req.body.imagesToDelete)) {
        console.log("enter successfully");
        for (const imageId of req.body.imagesToDelete) {
            try {
                await cloudUpload_1.default.uploader.destroy(imageId);
                room.images = room.images.filter((image) => image.id !== imageId);
            }
            catch (error) {
                return next(new appError_1.AppError("Failed to delete image", 500));
            }
        }
    }
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
            try {
                const { public_id, secure_url } = await cloudUpload_1.default.uploader.upload(file.path, {
                    folder: `${process.env.CLOUD_FOLDER_NAME}/room/photos`
                });
                room.images.push({
                    url: secure_url,
                    id: public_id
                });
            }
            catch (error) {
                return next(new appError_1.AppError("Failed to upload image", 500));
            }
        }
    }
    const updateData = req.body;
    console.log(updateData);
    Object.assign(room, updateData);
    await room.save();
    res.status(200).json({
        success: true,
        message: "Room updated successfully",
        data: room,
    });
});
exports.deleteRoom = (async (req, res, next) => {
    const roomId = req.params.id;
    const room = await room_model_1.Room.findById(roomId);
    if (!room)
        return next(new appError_1.AppError("Room noasyncHandlert found", 404));
    if (room.images && Array.isArray(room.images)) {
        for (const image of room.images) {
            try {
                await cloudUpload_1.default.uploader.destroy(image.id);
            }
            catch (error) {
                console.error(`Failed to delete image ${image.id} from Cloudinary`);
            }
        }
    }
    await room.deleteOne();
    res.status(200).json({
        success: true,
        message: "Room and all its images deleted successfully",
    });
});
