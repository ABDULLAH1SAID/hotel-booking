import { Booking } from "../../DB/models/Booking.model";
import { Room } from "../../DB/models/room.model";
import { NextFunction, Request } from "express";
import Stripe from "stripe";
import mongoose from "mongoose";
import { AppError } from "../../utils/appError";
import {BookingStatus} from "../../types/webhook.interface"

const stripe = new Stripe(process.env.STRIPE_KEY as string);
const endPoint = process.env.STRIPE_WEBHOOK_SECRET;

export const constructWebhookEvent = (req: Request, next:NextFunction):Stripe.Event => {
  const sig = req.headers["stripe-signature"];
  try {
    return stripe.webhooks.constructEvent(req.body, sig as string, endPoint as string);
  } catch (err) {
    console.log("❌ Webhook signature verification failed:", err);
    throw new AppError("Webhook signature verification failed!", 400);
  }
};

// Helper function لحذف التواريخ المحجوزة من الغرفة
export const removeBookedDatesFromRoom = async ( roomId: string,checkIn: Date, checkOut: Date) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      console.log("❌ Room not found for booking.");
      throw new AppError("Room not found!", 404);
    }
    // حذف التواريخ المحجوزة المطابقة من المصفوفة
    room.bookedDates = room.bookedDates.filter((date) => {
      const dateCheckIn = new Date(date.checkIn).getTime();
      const dateCheckOut = new Date(date.checkOut).getTime();
      const targetCheckIn = checkIn.getTime();
      const targetCheckOut = checkOut.getTime();

      return !(dateCheckIn === targetCheckIn && dateCheckOut === targetCheckOut);
    });
    await room.save();
    console.log("✅ Booked dates removed successfully from room:", roomId);
    
  } catch (error) {
    console.log("❌ Error removing booked dates:", error);
   throw new AppError("Failed to remove booked dates", 500);
  }
};

// Helper function لإضافة التواريخ المحجوزة للغرفة
export const addBookedDatesToRoom = async (roomId: string, checkIn: Date, checkOut: Date) => {

  try{
    const room = await Room.findById(roomId);
    if (!room) {
      console.error("❌ Room not found, cannot add booked dates.");
      throw new AppError("❌ Room not found, cannot add booked dates.",404)
    }
    room.bookedDates.push({
      checkIn,
      checkOut,
    });
    await room.save();
  }
  catch(error){
    console.error("❌ Error adding booked dates:", error);
    throw error;
  }    
  }


// Helper function لتحديث الحجز
export const updateBookingDetails = async (bookingId: string,userId: string,roomId: string, checkInDate: string,
   checkOutDate: string, totalPrice: string, paymentIntentId: string, status: BookingStatus) => {
    try{ 
      const booking = await Booking.findOne({ _id: bookingId });
      if (!booking) {
      throw new Error("Booking not found");
      }
    // حفظ البيانات القديمة
    const oldRoomId = booking.room.toString();
    const oldCheckIn = booking.checkInDate;
    const oldCheckOut = booking.checkOutDate;
    // تحديث البيانات الجديدة
    booking.checkInDate = new Date(checkInDate);
    booking.checkOutDate = new Date(checkOutDate);
    booking.totalPrice = Number(totalPrice);
    booking.paymentIntentId = paymentIntentId;
    booking.room = new mongoose.Types.ObjectId(roomId);
    booking.user = new mongoose.Types.ObjectId(userId);

    booking.status = status ;

    await booking.save();

    await removeBookedDatesFromRoom(oldRoomId, oldCheckIn, oldCheckOut);

    await addBookedDatesToRoom(roomId, new Date(checkInDate), new Date(checkOutDate));

    return booking;}
    catch(error){
     console.error("❌ Error updating booking details:", error);
     throw error;
    }
};