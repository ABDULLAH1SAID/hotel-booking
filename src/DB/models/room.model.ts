import { Schema, model, Document, QueryWithHelpers, Types } from "mongoose";
import { IRoom, RoomType } from "../../types/room.interfaces";

interface QueryHelpers {
  paginate(this: QueryWithHelpers<IRoom[], IRoom, QueryHelpers>, page: number, limit: number): QueryWithHelpers<IRoom[], IRoom>;
}

const RoomSchema = new Schema<IRoom, any, any, QueryHelpers>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    roomType: { type: String, enum: Object.values(RoomType), required: true },
    amenities: { type: [String], default: [] },
    images: [
      {
        id: { type: String },
        url: { type: String }
      }
    ],
  bookedDates: [
      {
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true }
      }
    ]
  ,
   isAvailable: {
    type: Boolean,
    default: true,
    required: true
  },
},
  {
   timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }

   }
);

RoomSchema.query.paginate = function (page: number, limit: number = 4): QueryWithHelpers<IRoom[], IRoom, QueryHelpers>{
  page = page < 1 || isNaN(page) || !page ? 1 : page;
  limit = limit < 1 || isNaN(limit) || !limit ? 4 : limit;
  const skip: number = limit * (page - 1);
  return this.skip(skip).limit(limit);
};


export const Room = model<IRoom>('Room', RoomSchema);
