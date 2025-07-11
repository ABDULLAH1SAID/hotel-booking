import Joi from "joi";

export const register = Joi.object({
  userName: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
}).required();

export const activateAccount = Joi.object({
    token: Joi.string().required()
}).required();

export const login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()

}).required()

export const forgetCode = Joi.object({
    email: Joi.string().email().required(),
}).required()

export const resetPassword = Joi.object({
    email:Joi.string().email().required(),
    forgetCode:Joi.string().length(6).required(),
    password:Joi.string().required(),
    confirmPassword:Joi.string().valid(Joi.ref("password")).required(),
}).required()