import Joi from "Joi";
import { isValidObjectId } from "../../middlewares/validation"

export const createBooking= Joi.object({
  room: Joi.string().required(),
  checkInDate: Joi.date().required(),
  checkOutDate: Joi.date().required(),
});

export const cancelBooking = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
}).required();

export const updateBooking = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
  room: Joi.string().custom(isValidObjectId).required(),
  checkInDate: Joi.date().required(),
  checkOutDate: Joi.date().required()
}).required();