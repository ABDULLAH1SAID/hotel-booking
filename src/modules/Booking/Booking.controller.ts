import { asyncHandler } from "../../utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import { AuthenticatedRequest } from "../../types/isAuthenticate.interface";
import { AppError } from "../../utils/appError";
import { Room } from "../../DB/models/room.model";
import { Booking } from "../../DB/models/Booking.model";
import { cBooking } from "../../types/booking.interface";

export const createBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response, next:NextFunction) => {
  const user = req.user._id as string;
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const { room, checkInDate, checkOutDate }: cBooking = req.body;

  if (!room || !checkInDate || !checkOutDate) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const foundRoom = await Room.findById(room);
  if (!foundRoom) {
    return next(new AppError("Room not found", 404));
  }
  if (!foundRoom.isAvailable) {
    return next(new AppError("Room is not available for booking", 400));
  }

   if (new Date(checkInDate) < new Date()) {
    return next(new AppError("Check-in date cannot be in the past", 400));
  }
  if (new Date(checkOutDate) < new Date()) {
    return next(new AppError("Check-out date cannot be in the past", 400));
  }

  if (checkInDate >= checkOutDate) {
    return next(new AppError("Check-out date must be after check-in date", 400));
  }
  // Check if the room is already booked for the selected dates
  const isBooked = foundRoom.bookedDates.some((date) => {
    return (
      (new Date(checkInDate) >= new Date(date.checkIn) && new Date(checkInDate) < new Date(date.checkOut)) ||
      (new Date(checkOutDate) > new Date(date.checkIn) && new Date(checkOutDate) <= new Date(date.checkOut)) ||
      (new Date(checkInDate) < new Date(date.checkIn) && new Date(checkOutDate) > new Date(date.checkOut))
    );
  });

    if (isBooked) {
      return next(new AppError("Room is not available for the selected dates.", 400));
    }

  const stayDuration = (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24);

  const totalPrice = stayDuration * foundRoom.pricePerNight;

  const stripe = new Stripe(process.env.STRIPE_KEY as string);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `https://hotel-booking-a4dr.vercel.app/success`,
    cancel_url: `https://hotel-booking-a4dr.vercel.app/cancel`,
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


export const cancelBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user._id as string;
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const { id } = req.params;

  if (!id) {
    return next(new AppError("Booking ID is required", 400));
  }

  const booking = await Booking.findById(id);

  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }
  console.log(booking.user.toString(), user.toString());

  if (booking.user.toString() !== user.toString()) {
    return next(new AppError("You are not authorized to cancel this booking", 403));
  }

  const stripe = new Stripe(process.env.STRIPE_KEY as string);
  // Cancel the Stripe Checkout session
  const refund = await stripe.refunds.create({
    payment_intent: booking.paymentIntentId,
    amount: booking.totalPrice *100, // Convert to cents
  });
  // Check if the refund was successful
  if (!refund) {  
  return next(new AppError("Failed to process refund. Please try again later.", 500));
  }

  if (refund.status !== "succeeded") {
  return next(new AppError("Failed to process refund. Please try again later.", 500));
  }

  res.status(204).json({
    success: true,
    data: null,
    refund,
  });

});

export const updateBooking = asyncHandler(async (req:AuthenticatedRequest, res:Response, next:NextFunction)=>{
  const user = req.user._id as string;
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const { id } = req.params;
  if (!id) {
    return next(new AppError("Booking ID is required", 400));
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }

  if (booking.user.toString() !== user.toString()) {
    return next(new AppError("You are not authorized to update this booking", 403));
  }

  const {room, checkInDate, checkOutDate }: cBooking = req.body
  if (!room) {
    return next(new AppError("Room ID is required", 400));
  }

  if (!checkInDate || !checkOutDate) {
    return next(new AppError("Please provide check-in and check-out dates", 400));
  }
  if (new Date(checkInDate) < new Date()) {
    return next(new AppError("Check-in date cannot be in the past", 400));
  }
  if (new Date(checkOutDate) < new Date()) {
    return next(new AppError("Check-out date cannot be in the past", 400));
  }
  if (checkInDate >= checkOutDate) {
    return next(new AppError("Check-out date must be after check-in date", 400));
  }
    const foundRoom = await Room.findById(room);
  if (!foundRoom) {
    return next(new AppError("Room not found", 404));
  }
  if (!foundRoom.isAvailable) {
    return next(new AppError("Room is not available for booking", 400));
  }
  const userCheckInDate =  booking.checkInDate;
  const userCheckOutDate = booking.checkOutDate;

  const bookedDates = foundRoom.bookedDates.filter(
  date =>
    !(date.checkIn === userCheckInDate && date.checkOut === userCheckOutDate)
  );

   const isBooked = bookedDates.some((date) => {
     return (
       (new Date(checkInDate) >= new Date(date.checkIn) && new Date(checkInDate) < new Date(date.checkOut)) ||
       (new Date(checkOutDate) > new Date(date.checkIn) && new Date(checkOutDate) <= new Date(date.checkOut)) ||
       (new Date(checkInDate) < new Date(date.checkIn) && new Date(checkOutDate) > new Date(date.checkOut)) 
     );

   });

   if (isBooked) {
     return next(new AppError("Room is not available for the selected dates.", 400));
   }

   const stayDuration = (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24);
   const totalPrice = stayDuration * foundRoom.pricePerNight;
   const totalPrice2 = booking.totalPrice

   if (totalPrice > totalPrice2) { 
     const stripe = new Stripe(process.env.STRIPE_KEY as string);
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
         bookingId: id.toString(),
         userId: user.toString(),
         roomId: room.toString(),
         checkInDate: checkInDate.toString(),
         checkOutDate: checkOutDate.toString(),
         totalPrice: totalPrice.toString(),
         paymentIntentId: booking.paymentIntentId.toString(),
        
       },
     });

    return res.status(201).json({
      success: true,
      data: session.url,
    });
  }

   if (totalPrice < totalPrice2) {
  const stripe = new Stripe(process.env.STRIPE_KEY as string);

  const refund = await stripe.refunds.create({
    payment_intent: booking.paymentIntentId,
    amount: (totalPrice2 - totalPrice) * 100,
    metadata: {
      bookingId: id.toString(),
      userId: user.toString(),
      roomId: room.toString(),
      checkInDate: checkInDate.toString(),
      checkOutDate: checkOutDate.toString(),
      totalPrice: totalPrice.toString()
    }
  });

  if (!refund || refund.status !== "succeeded") {
    return next(new AppError("Failed to process refund. Please try again later.", 500));
  }
  return res.status(200).json({
     success: true,
     message: "Refund processed successfully",
     data: null,
  });
 }

 else{
  const oldRoomId = booking.room.toString();
  const userCheckInDate = booking.checkInDate;
  const userCheckOutDate = booking.checkOutDate;

  booking.checkInDate = new Date(checkInDate);
  booking.checkOutDate = new Date(checkOutDate);
  booking.totalPrice = totalPrice;
  booking.room = room;
  await booking.save();

  const oldRoom = await Room.findById(oldRoomId);
  if (oldRoom) {
    oldRoom.bookedDates = oldRoom.bookedDates.filter(date =>
      !(new Date(date.checkIn).getTime() === new Date(userCheckInDate).getTime() &&
        new Date(date.checkOut).getTime() === new Date(userCheckOutDate).getTime())
    );
    await oldRoom.save();
  }

  const newRoom = await Room.findById(room);
  if (newRoom) {
    newRoom.bookedDates.push({
      checkIn: new Date(checkInDate),
      checkOut: new Date(checkOutDate),
    });
    await newRoom.save();
  }

  return res.status(200).json({
    success: true,
    message: "Booking updated successfully with no price change.",
  });
}

});
