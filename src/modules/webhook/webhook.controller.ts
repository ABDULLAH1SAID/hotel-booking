import { Booking } from "../../DB/models/Booking.model";
import { Room } from "../../DB/models/room.model";
import e, { Request, Response } from "express";
import Stripe from "stripe";
import { asyncHandler } from "../../utils/asyncHandler";

const stripe = new Stripe(process.env.STRIPE_KEY as string);
const endPoint = process.env.STRIPE_WEBHOOK_SECRET;

export const mainWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, endPoint as string);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return res.status(400).send("Webhook signature verification failed");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("🎉 Checkout Session Completed:", session.metadata);
    try {      
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

      room.bookedDates.push({
        checkIn,
        checkOut,
      });
      await room.save();

      booking.status = "confirmed"; 
      await booking.save();

      console.log("✅ Booking created successfully:", booking._id);
    } catch (err) {
      console.error("❌ Error processing booking:", err);
      return res.status(500).end();
    }
  }

   if (event.type === "charge.refunded") {
     const refund = event.data.object ;
     console.log("💸 Charge Refunded:", refund.id);
     try {
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

      const room = await Room.findById(booking.room);
      if (!room) {
        console.error("❌ Room not found for booking.");
        return res.status(404).end();
      }

      room.bookedDates = room.bookedDates.filter((date) => {
        return !(new Date(date.checkIn).getTime() === new Date(booking.checkInDate).getTime() &&
                 new Date(date.checkOut).getTime() === new Date(booking.checkOutDate).getTime());
      });

      await room.save();

      } catch (err) {
        console.error("❌ Error processing refund:", err);
        return res.status(500).end();
      }
    }
   res.status(200).end();
});

export const updateWebhook  = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, endPoint as string);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return res.status(400).send("Webhook signature verification failed");
  }


  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
  }

  res.status(200).end();
});