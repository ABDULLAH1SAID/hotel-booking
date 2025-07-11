"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBooking = exports.cancelBooking = exports.createBooking = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const stripe_1 = __importDefault(require("stripe"));
const appError_1 = require("../../utils/appError");
const room_model_1 = require("../../DB/models/room.model");
const Booking_model_1 = require("../../DB/models/Booking.model");
exports.createBooking = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user._id;
    if (!user) {
        return next(new appError_1.AppError("User not found", 404));
    }
    const { room, checkInDate, checkOutDate } = req.body;
    if (!room || !checkInDate || !checkOutDate) {
        return next(new appError_1.AppError("Please provide all required fields", 400));
    }
    const foundRoom = await room_model_1.Room.findById(room);
    if (!foundRoom) {
        return next(new appError_1.AppError("Room not found", 404));
    }
    if (!foundRoom.isAvailable) {
        return next(new appError_1.AppError("Room is not available for booking", 400));
    }
    if (new Date(checkInDate) < new Date()) {
        return next(new appError_1.AppError("Check-in date cannot be in the past", 400));
    }
    if (new Date(checkOutDate) < new Date()) {
        return next(new appError_1.AppError("Check-out date cannot be in the past", 400));
    }
    if (checkInDate >= checkOutDate) {
        return next(new appError_1.AppError("Check-out date must be after check-in date", 400));
    }
    // Check if the room is already booked for the selected dates
    const isBooked = foundRoom.bookedDates.some((date) => {
        return ((new Date(checkInDate) >= new Date(date.checkIn) && new Date(checkInDate) < new Date(date.checkOut)) ||
            (new Date(checkOutDate) > new Date(date.checkIn) && new Date(checkOutDate) <= new Date(date.checkOut)) ||
            (new Date(checkInDate) < new Date(date.checkIn) && new Date(checkOutDate) > new Date(date.checkOut)));
    });
    if (isBooked) {
        return next(new appError_1.AppError("Room is not available for the selected dates.", 400));
    }
    const stayDuration = (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24);
    const totalPrice = stayDuration * foundRoom.pricePerNight;
    const stripe = new stripe_1.default(process.env.STRIPE_KEY);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        success_url: `http://localhost:3000/success`,
        cancel_url: `http://localhost:3000/cancel`,
        line_items: [
            {
                price_data: {
                    currency: "egp",
                    product_data: {
                        name: foundRoom.name,
                        description: foundRoom.description,
                    },
                    unit_amount: totalPrice * 100,
                },
                quantity: 1,
            },
        ],
        metadata: {
            userId: user.toString(),
            roomId: room.toString(),
            checkInDate: checkInDate.toString(),
            checkOutDate: checkOutDate.toString(),
            totalPrice: totalPrice.toString(),
        },
    });
    res.status(201).json({
        success: true,
        data: session.url,
    });
});
exports.cancelBooking = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user._id;
    if (!user) {
        return next(new appError_1.AppError("User not found", 404));
    }
    const { id } = req.params;
    if (!id) {
        return next(new appError_1.AppError("Booking ID is required", 400));
    }
    const booking = await Booking_model_1.Booking.findById(id);
    if (!booking) {
        return next(new appError_1.AppError("Booking not found", 404));
    }
    console.log(booking.user.toString(), user.toString());
    if (booking.user.toString() !== user.toString()) {
        return next(new appError_1.AppError("You are not authorized to cancel this booking", 403));
    }
    const stripe = new stripe_1.default(process.env.STRIPE_KEY);
    // Cancel the Stripe Checkout session
    const refund = await stripe.refunds.create({
        payment_intent: booking.paymentIntentId,
        amount: booking.totalPrice,
    });
    // Check if the refund was successful
    if (!refund) {
        return next(new appError_1.AppError("Failed to process refund. Please try again later.", 500));
    }
    if (refund.status !== "succeeded") {
        return next(new appError_1.AppError("Failed to process refund. Please try again later.", 500));
    }
    res.status(204).json({
        success: true,
        data: null,
        refund,
    });
});
exports.updateBooking = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user._id;
    if (!user) {
        return next(new appError_1.AppError("User not found", 404));
    }
    const { id } = req.params;
    if (!id) {
        return next(new appError_1.AppError("Booking ID is required", 400));
    }
    const booking = await Booking_model_1.Booking.findById(id);
    if (!booking) {
        return next(new appError_1.AppError("Booking not found", 404));
    }
    if (booking.user.toString() !== user.toString()) {
        return next(new appError_1.AppError("You are not authorized to update this booking", 403));
    }
    const { room, checkInDate, checkOutDate } = req.body;
    if (!room) {
        return next(new appError_1.AppError("Room ID is required", 400));
    }
    if (!checkInDate || !checkOutDate) {
        return next(new appError_1.AppError("Please provide check-in and check-out dates", 400));
    }
    if (new Date(checkInDate) < new Date()) {
        return next(new appError_1.AppError("Check-in date cannot be in the past", 400));
    }
    if (new Date(checkOutDate) < new Date()) {
        return next(new appError_1.AppError("Check-out date cannot be in the past", 400));
    }
    if (checkInDate >= checkOutDate) {
        return next(new appError_1.AppError("Check-out date must be after check-in date", 400));
    }
    const foundRoom = await room_model_1.Room.findById(room);
    if (!foundRoom) {
        return next(new appError_1.AppError("Room not found", 404));
    }
    if (!foundRoom.isAvailable) {
        return next(new appError_1.AppError("Room is not available for booking", 400));
    }
    const userCheckInDate = booking.checkInDate;
    const userCheckOutDate = booking.checkOutDate;
    const bookedDates = foundRoom.bookedDates.filter(date => !(date.checkIn === userCheckInDate && date.checkOut === userCheckOutDate));
    const isBooked = bookedDates.some((date) => {
        return ((new Date(checkInDate) >= new Date(date.checkIn) && new Date(checkInDate) < new Date(date.checkOut)) ||
            (new Date(checkOutDate) > new Date(date.checkIn) && new Date(checkOutDate) <= new Date(date.checkOut)) ||
            (new Date(checkInDate) < new Date(date.checkIn) && new Date(checkOutDate) > new Date(date.checkOut)));
    });
    if (isBooked) {
        return next(new appError_1.AppError("Room is not available for the selected dates.", 400));
    }
    const stayDuration = (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24);
    const totalPrice = stayDuration * foundRoom.pricePerNight;
    const totalPrice2 = booking.totalPrice;
    if (totalPrice > totalPrice2) {
        const stripe = new stripe_1.default(process.env.STRIPE_KEY);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `http://localhost:3000/success`,
            cancel_url: `http://localhost:3000/cancel`,
            line_items: [
                {
                    price_data: {
                        currency: "egp",
                        product_data: {
                            name: foundRoom.name,
                            description: foundRoom.description,
                        },
                        unit_amount: (totalPrice - totalPrice2) * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId: user.toString(),
                roomId: room.toString(),
                checkInDate: checkInDate.toString(),
                checkOutDate: checkOutDate.toString(),
                totalPrice: totalPrice.toString(),
            },
        });
        return res.status(201).json({
            success: true,
            data: session.url,
        });
    }
    if (totalPrice < totalPrice2) {
        const stripe = new stripe_1.default(process.env.STRIPE_KEY);
        const refund = await stripe.refunds.create({
            payment_intent: booking.paymentIntentId,
            amount: (totalPrice2 - totalPrice) * 100,
        });
        if (!refund || refund.status !== "succeeded") {
            return next(new appError_1.AppError("Failed to process refund. Please try again later.", 500));
        }
    }
    return res.status(200).json({
        success: true,
        data: null,
    });
});
