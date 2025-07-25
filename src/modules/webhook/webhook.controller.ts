import { Booking } from "../../DB/models/Booking.model";
import { Room } from "../../DB/models/room.model";
import  { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/appError";
import { constructWebhookEvent, addBookedDatesToRoom, removeBookedDatesFromRoom, updateBookingDetails } from "./webhook.services";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_KEY as string);
const endPoint = process.env.STRIPE_WEBHOOK_SECRET;

export const mainWebhook = asyncHandler(async (req: Request, res: Response, next:NextFunction) => {
  // const sig = req.headers["stripe-signature"];
  // let event;
  // try {
  //   event = stripe.webhooks.constructEvent(req.body, sig as string, endPoint as string);
  // } catch (err) {
  //   console.error("❌ Webhook signature verification failed:", err);
  //   return res.status(400).send("Webhook signature verification failed");
  // }  
    const event = constructWebhookEvent(req, next)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("🎉 Checkout Session Completed:", session.metadata);
        
        const metadata = session.metadata as {
        userId: string;
        roomId: string;
        checkInDate: string;
        checkOutDate: string;
        totalPrice: string;
      };
      const paymentIntentId = session.payment_intent as string;
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
      const room = await Room.findById(roomId);
      if (!room) {
        console.error("❌ Room not found, cannot create booking.");
        return res.status(400).end();
      }
      const booking = await Booking.create({
        user: userId,
        room: roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice: Number(totalPrice),
        paymentIntentId,
      });

      await addBookedDatesToRoom(roomId, checkIn, checkOut);

      // room.bookedDates.push({
      //   checkIn,
      //   checkOut,
      // });
      // await room.save();

      // booking.status = "confirmed"; 
      // await booking.save();

      console.log("✅ Booking created successfully:", booking._id);
  }

   if (event.type === "charge.refunded") {
     const refund = event.data.object ;
     console.log("💸 Charge Refunded:", refund.id);

       const paymentIntentId = refund.payment_intent as string;

       if (!paymentIntentId) {
         console.error("❌ Missing paymentIntentId in refund event.");
         return res.status(400).end();
       }

       const booking = await Booking.findOne({ paymentIntentId });

       if (!booking) {
         console.error("❌ Booking not found for cancelled paymentIntentId.");
         return res.status(404).end();
       }

       booking.status = "cancelled"; // لازم تكون عامل في الموديل status

       await booking.save();

      await removeBookedDatesFromRoom(
        booking.room.toString(), 
        booking.checkInDate, 
        booking.checkOutDate
      );

      console.log("✅ Booking cancelled and dates removed successfully:", booking._id);

      // const room = await Room.findById(booking.room);
      // if (!room) {
      //   console.error("❌ Room not found for booking.");
      //   return res.status(404).end();
      // }

      // room.bookedDates = room.bookedDates.filter((date) => {
      //   return !(new Date(date.checkIn).getTime() === new Date(booking.checkInDate).getTime() &&
      //            new Date(date.checkOut).getTime() === new Date(booking.checkOutDate).getTime());
      // });
      // await room.save();
    }
   res.status(200).end();
});


export const updateWebhook  = asyncHandler(async (req: Request, res: Response, next:NextFunction) => {
  // const sig = req.headers["stripe-signature"];

  // let event;
  // try {
  //   event = stripe.webhooks.constructEvent(req.body, sig as string, endPoint as string);
  // } catch (err) {
  //   console.error("❌ Webhook signature verification failed:", err);
  //   return res.status(400).send("Webhook signature verification failed");
  // } 
    const event = constructWebhookEvent(req, next)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const metadata = session.metadata as {
        bookingId: string;
        userId: string;
        roomId: string;
        checkInDate: string;
        checkOutDate: string;
        totalPrice: string;
      };
    const { bookingId ,userId, roomId, checkInDate, checkOutDate, totalPrice } = metadata;
    const booking = await Booking.findOne( { _id: bookingId });
    if (!booking) {
      return res.status(404).end();
    }
    const paymentIntentId = session.payment_intent as string;


    await updateBookingDetails(bookingId ,userId, roomId, checkInDate, checkOutDate, totalPrice, paymentIntentId, "confirmed");

  //   const oldRoomId = booking.room.toString();
  //   const oldCheckIn = booking.checkInDate;
  //   const oldCheckOut = booking.checkOutDate;
    
  //   booking.checkInDate = new Date(checkInDate);
  //   booking.checkOutDate = new Date(checkOutDate);
  //   booking.totalPrice = Number(totalPrice);
  //   booking.paymentIntentId = session.payment_intent as string;
  //   booking.room = new mongoose.Types.ObjectId(roomId);
  //   booking.user = new mongoose.Types.ObjectId(userId);
  //   booking.status = "confirmed";
  //   await booking.save();

  // const oldRoom = await Room.findById(oldRoomId);
  //   if (oldRoom) {
  //     oldRoom.bookedDates = oldRoom.bookedDates.filter(date =>
  //       !(
  //         new Date(date.checkIn).getTime() === new Date(oldCheckIn).getTime() &&
  //         new Date(date.checkOut).getTime() === new Date(oldCheckOut).getTime()
  //       )
  //     );
  //     await oldRoom.save();
  //   }

  //   const newRoom = await Room.findById(roomId);
  //   if (newRoom) {
  //     newRoom.bookedDates.push({
  //       checkIn: new Date(checkInDate),
  //       checkOut: new Date(checkOutDate),
  //     });
  //     await newRoom.save();
  //   }
    console.log("✅ Booking updated successfully:");
    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully and booking updated., and your payment has been confirmed",
    });
  }
   if (event.type === "charge.refunded") {
   const charge = event.data.object as Stripe.Charge;
   const paymentIntentId = charge.payment_intent as string;
    if (!paymentIntentId) {
      console.error("❌ Missing paymentIntentId in refund event.");
      return res.status(400).end();
   }
    const metadata = charge.metadata as {
      bookingId: string;
      userId: string;
      roomId: string;
      checkInDate: string;
      checkOutDate: string;
      totalPrice: string;
    };
    const { bookingId ,userId, roomId, checkInDate, checkOutDate, totalPrice } = metadata;
  //   const oldRoomId = booking.room.toString();
  //   const oldCheckIn = booking.checkInDate;
  //   const oldCheckOut = booking.checkOutDate;
    
  //   booking.checkInDate = new Date(checkInDate);
  //   booking.checkOutDate = new Date(checkOutDate);
  //   booking.totalPrice = Number(totalPrice);
  //   booking.paymentIntentId = charge.payment_intent as string;
  //   booking.room = new mongoose.Types.ObjectId(roomId);
  //   booking.user = new mongoose.Types.ObjectId(userId);
  //   booking.status = "confirmed";
  //   await booking.save();

  // const oldRoom = await Room.findById(oldRoomId);
  //   if (oldRoom) {
  //     oldRoom.bookedDates = oldRoom.bookedDates.filter(date =>
  //       !(
  //         new Date(date.checkIn).getTime() === new Date(oldCheckIn).getTime() &&
  //         new Date(date.checkOut).getTime() === new Date(oldCheckOut).getTime()
  //       )
  //     );
  //     await oldRoom.save();
  //   }

  //   const newRoom = await Room.findById(roomId);
  //   if (newRoom) {
  //     newRoom.bookedDates.push({
  //       checkIn: new Date(checkInDate),
  //       checkOut: new Date(checkOutDate),
  //     });
  //     await newRoom.save();
  //   }

  await updateBookingDetails(
    bookingId,
    userId,
    roomId,
    checkInDate,
    checkOutDate,
    totalPrice,
    paymentIntentId,
    "cancelled",
  );

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully and booking updated. and your payment has been refunded",
    });
  }
});