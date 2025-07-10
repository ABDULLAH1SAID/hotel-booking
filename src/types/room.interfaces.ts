import { Document } from "mongoose";

export interface ImageType {
  id: string;
  url: string;
}

export enum RoomType {
  SINGLE = "Single",
  DOUBLE = "Double",
  SUITE = "Suite",
  DELUXE = "Deluxe",
}

export interface BookingDate {
  checkIn: Date;
  checkOut: Date;
}

export interface IRoom extends Document {
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  roomType: RoomType;
  amenities: string[];
  images: ImageType[];
  defaultImage: ImageType;
  bookedDates: BookingDate[];
  isAvailable: boolean;
}

export interface RoomQueryParams {
  page?: string;
  limit?: string;
  roomType?: string;
  minPrice?: string;
  maxPrice?: string;
  isAvailable?: string;
}

