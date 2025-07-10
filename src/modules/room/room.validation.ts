import Joi from "Joi"
import { RoomType } from "../../types/room.interfaces"
import { isValidObjectId } from "mongoose";

export const createRoom = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  description: Joi.string().min(5).required(),
  pricePerNight: Joi.number().min(0).required(),
  capacity: Joi.number().min(1).required(),
  roomType: Joi.string().valid(...Object.values(RoomType)).required(),
  amenities: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.string().uri()).default([]),
  isAvailable: Joi.boolean().default(true),
}).required();

export const updateRoom = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
  name: Joi.string().trim().min(3).max(100),
  description: Joi.string().min(5),
  pricePerNight: Joi.number().min(0),
  capacity: Joi.number().min(1),
  roomType: Joi.string().valid(...Object.values(RoomType)),
  amenities: Joi.array(),
  images: Joi.array(),
  isAvailable: Joi.boolean(),
  imagesToDelete: Joi.alternatives().try(
  Joi.string(),
  Joi.array().items(Joi.string())
).optional()
}).required();

export const deleteRoom = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
}).required()