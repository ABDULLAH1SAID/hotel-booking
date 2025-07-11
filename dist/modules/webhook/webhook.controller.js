"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWebhook = exports.mainWebhook = void 0;
const Booking_model_1 = require("../../DB/models/Booking.model");
const room_model_1 = require("../../DB/models/room.model");
const stripe_1 = __importDefault(require("stripe"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const stripe = new stripe_1.default(process.env.STRIPE_KEY);
const endPoint = process.env.STRIPE_WEBHOOK_SECRET;
exports.mainWebhook = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endPoint);
    }
    catch (err) {
        console.error("❌ Webhook signature verification failed:", err);
        return res.status(400).send("Webhook signature verification failed");
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        console.log("🎉 Checkout Session Completed:", session.metadata);
        try {
            const metadata = session.metadata;
            const paymentIntentId = session.payment_intent;
            const { userId, roomId, checkInDate, checkOutDate, totalPrice } = metadata;
            if (!userId || !roomId || !checkInDate || !checkOutDate || !totalPrice || !paymentIntentId) {
                console.error("❌ Missing metadata, cannot create booking.");
                return res.status(400).end();
            }
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
                console.error("❌ Invalid check-in or check-out date.");
                return res.status(400).end();
            }
            const room = await room_model_1.Room.findById(roomId);
            if (!room) {
                console.error("❌ Room not found, cannot create booking.");
                return res.status(400).end();
            }
            const booking = await Booking_model_1.Booking.create({
                user: userId,
                room: roomId,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                totalPrice: Number(totalPrice),
                paymentIntentId,
            });
            room.bookedDates.push({
                checkIn,
                checkOut,
            });
            await room.save();
            booking.status = "confirmed";
            await booking.save();
            console.log("✅ Booking created successfully:", booking._id);
        }
        catch (err) {
            console.error("❌ Error processing booking:", err);
            return res.status(500).end();
        }
    }
    if (event.type === "charge.refunded") {
        const refund = event.data.object;
        console.log("💸 Charge Refunded:", refund.id);
        try {
            const paymentIntentId = refund.payment_intent;
            if (!paymentIntentId) {
                console.error("❌ Missing paymentIntentId in refund event.");
                return res.status(400).end();
            }
            const booking = await Booking_model_1.Booking.findOne({ paymentIntentId });
            if (!booking) {
                console.error("❌ Booking not found for cancelled paymentIntentId.");
                return res.status(404).end();
            }
            booking.status = "cancelled"; // لازم تكون عامل في الموديل status
            await booking.save();
            const room = await room_model_1.Room.findById(booking.room);
            if (!room) {
                console.error("❌ Room not found for booking.");
                return res.status(404).end();
            }
            room.bookedDates = room.bookedDates.filter((date) => {
                return !(new Date(date.checkIn).getTime() === new Date(booking.checkInDate).getTime() &&
                    new Date(date.checkOut).getTime() === new Date(booking.checkOutDate).getTime());
            });
            await room.save();
        }
        catch (err) {
            console.error("❌ Error processing refund:", err);
            return res.status(500).end();
        }
    }
    res.status(200).end();
});
exports.updateWebhook = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endPoint);
    }
    catch (err) {
        console.error("❌ Webhook signature verification failed:", err);
        return res.status(400).send("Webhook signature verification failed");
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
    }
    res.status(200).end();
});
