
import { Schema, model } from "mongoose";
import { IBooking } from "../../types/booking.interface"
const BookingSchema = new Schema<IBooking>(
  {
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    paymentIntentId: { type: String, required: true } // Stripe payment intent ID
  },
  { timestamps: true }
);

export const Booking = model<IBooking>("Booking", BookingSchema);

