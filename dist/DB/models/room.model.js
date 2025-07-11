"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const mongoose_1 = require("mongoose");
const room_interfaces_1 = require("../../types/room.interfaces");
const RoomSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    roomType: { type: String, enum: Object.values(room_interfaces_1.RoomType), required: true },
    amenities: { type: [String], default: [] },
    images: [
        {
            id: { type: String },
            url: { type: String }
        }
    ],
    bookedDates: [
        {
            checkIn: { type: Date, required: true },
            checkOut: { type: Date, required: true }
        }
    ],
    isAvailable: {
        type: Boolean,
        default: true,
        required: true
    },
}, {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
RoomSchema.query.paginate = function (page, limit = 4) {
    page = page < 1 || isNaN(page) || !page ? 1 : page;
    limit = limit < 1 || isNaN(limit) || !limit ? 4 : limit;
    const skip = limit * (page - 1);
    return this.skip(skip).limit(limit);
};
exports.Room = (0, mongoose_1.model)('Room', RoomSchema);
