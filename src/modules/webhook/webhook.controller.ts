import { Booking } from "../../DB/models/Booking.model";
import { Room } from "../../DB/models/room.model";
import  { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/appError";
import Stripe from "stripe";
import { asyncHandler } from "../../utils/asyncHandler";
import { constructWebhookEvent, addBookedDatesToRoom, removeBookedDatesFromRoom, updateBookingDetails } from "./webhook.services";


export const mainWebhook = asyncHandler(async (req: Request, res: Response, next:NextFunction) => {
  const endPoint = process.env.MAIN_STRIPE_WEBHOOK_SECRET;

    const event = constructWebhookEvent(req, next, endPoint);

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

       booking.status = "confirmed"; 
       await booking.save();

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
    }
   res.status(200).end();
});


export const updateWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const endPoint = process.env.UPDATE_STRIPE_WEBHOOK_SECRET;
  
  try {
    const event = constructWebhookEvent(req, next, endPoint);

    // معالجة حدث اكتمال الدفع لتحديث الحجز
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata as {
        action: string;
        bookingId: string;
        userId: string;
        roomId: string;
        oldRoomId: string;
        oldCheckIn: string;
        oldCheckOut: string;
        newCheckIn: string;
        newCheckOut: string;
        totalPrice: string;
      };

      // التحقق من نوع الإجراء
      if (metadata.action !== 'booking_update') {
        console.log('⚠️ Ignoring non-booking-update event');
        return res.status(200).json({ success: true });
      }

      // التحقق من وجود الحجز
      const booking = await Booking.findById(metadata.bookingId);
      if (!booking) {
        console.error(`❌ Booking not found: ${metadata.bookingId}`);
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      // التحقق من أن الحجز في حالة انتظار
      if (booking.status !== "pending") {
        console.error(`❌ Booking not in pending state: ${booking.status}`);
        return res.status(400).json({ success: false, message: "Invalid booking state" });
      }

      try {
        // 1. إزالة التواريخ القديمة من الغرفة القديمة
        await removeBookedDatesFromRoom(
          metadata.oldRoomId,
          new Date(metadata.oldCheckIn),
          new Date(metadata.oldCheckOut)
        );

        // 2. تحديث بيانات الحجز
        await updateBookingDetails(
          metadata.bookingId,
          metadata.userId,
          metadata.roomId,
          metadata.newCheckIn,
          metadata.newCheckOut,
          metadata.totalPrice,
          session.payment_intent as string,
          "confirmed"
        );

        console.log(`✅ Booking ${metadata.bookingId} updated successfully`);
        return res.status(200).json({ success: true });
        
      } catch (updateError) {
        console.error('❌ Update failed, reverting changes:', updateError);
        
        // محاولة استعادة الحجز لحالته الأصلية
        try {
          await Booking.findByIdAndUpdate(metadata.bookingId, { status: "cancelled" });
        } catch (revertError) {
          console.error('❌ Failed to revert booking:', revertError);
        }
        
        return res.status(500).json({ success: false, message: "Failed to process update" });
      }
    }

    // معالجة حدث رد الأموال
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const metadata = charge.metadata as {
        action: string;
        bookingId: string;
        userId: string;
        roomId: string;
        oldRoomId: string;
        oldCheckIn: string;
        oldCheckOut: string;
        newCheckIn: string;
        newCheckOut: string;
        priceDifference: string;
        totalPrice: string;
      };

      if (metadata.action !== 'booking_update_refund') {
        return res.status(200).json({ success: true });
      }

      try {
        await Booking.findByIdAndUpdate(
          metadata.bookingId,
          {
            $inc: { totalPrice: -Number(metadata.priceDifference) },
            paymentIntentId: charge.payment_intent
          }
        );

        console.log(`✅ Refund processed for booking ${metadata.bookingId}`);
        return res.status(200).json({ success: true });
        
      } catch (error) {
        console.error('❌ Refund processing failed:', error);
        return res.status(500).json({ success: false, message: "Failed to process refund" });
      }
    }

    // إذا كان الحدث غير معروف
    console.log(`⚠️ Unhandled event type: ${event.type}`);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return next(new AppError("Webhook processing failed", 500));
  }
});