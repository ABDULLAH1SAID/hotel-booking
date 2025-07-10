import { Router } from 'express'
const router = Router()
import { validation } from '../../middlewares/validation';
import * as authSchema from './auth.validation'
import * as authController from './auth.controller'
router.post('/register',validation(authSchema.register),authController.register)
router.get("/activate_account/:token", validation(authSchema.activateAccount), authController.activateAccount)
router.post('/login',validation(authSchema.login),authController.login)
router.patch("/forgetCode",validation(authSchema.forgetCode),authController.forgetCode)
router.patch("/resetPassword",validation(authSchema.resetPassword),authController.resetPassword)



export default router;