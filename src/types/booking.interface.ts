import { Document, Types } from "mongoose";

export interface IBooking extends Document {
  room: Types.ObjectId;
  user: Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentIntentId: string; 
}

export interface cBooking { 
  room: Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
}