import express from "express";
import * as userSchema from './user.validation'
import * as userController from './user.controller'
import { validation } from '../../middlewares/validation';
import { isAuthenticated } from "../../middlewares/isAuthenticated";


const router = express.Router();

router.get("/",isAuthenticated,userController.getProfile); 
router.patch("/",isAuthenticated,validation(userSchema.updateProfile), userController.updateProfile)

export default router;
