import mongoosePaginate from "mongoose-paginate-v2";
import { Schema, model, PaginateModel } from "mongoose";
import { IRoom, RoomType } from "../../types/room.interfaces";

const RoomSchema = new Schema<IRoom>({
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
RoomSchema.plugin(mongoosePaginate);

export const Room = model<IRoom, PaginateModel<IRoom>>('Room', RoomSchema);




