import Joi from "Joi";

export const updateProfile = Joi.object({
    userName: Joi.string().min(3).max(20),
    email: Joi.string().email(),
    gender: Joi.string().valid("male", "female"),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/)
});
