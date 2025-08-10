import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import { RegisterRequest, loginRequest, loginResponse, forgetCodeRequest,resetPasswordRequest} from "../../types/auth.interfaces"
import { User } from "../../DB/models/user.model";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmail";
import { Token } from "../../DB/models/token.model";
import { signUpTemplate, resetPasswordTemplate } from "../../utils/htmlTemplets";
import { AppError } from "../../utils/appError";
import Randomstring from 'randomstring';
import bcrypt from"bcrypt";

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userName, email, password, confirmPassword }: RegisterRequest = req.body;

  if (!userName || !email || !password || !confirmPassword) {
      return next(new AppError("All fields are required", 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("email already exsist", 409));
  }
  const token = jwt.sign({email},process.env.TOKEN_SECRET as string)
  
 await User.create({
    userName,
    email,
    password,
  });
    const confirmationlink =`http://localhost:3000/auth/activate_account/${token}`

    const messageSent = await sendEmail({to:email,subject:"Activated Account",html:signUpTemplate(confirmationlink)});
    if(!messageSent) return next(new AppError("something went wrong!",500))

  return res.status(201).json({
    success: true,
    message: 'Check your email!',
  });
});

export const activateAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { email } = jwt.verify(token, process.env.TOKEN_SECRET as string) as JwtPayload;

    const user = await User.findOneAndUpdate({ email },{ isConfirmed: true });
    if (!user) {
    return next(new AppError("User not found", 404));
}
    return res.status(201).json({success: true,message:"try to login!"})
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction)=>{
  const{email ,password }:loginRequest = req.body

      const user = await User.findOne({ email });
      if (!user)  return next(new AppError("invalid email!", 403));
  
      if (!user.isConfirmed)
          return next(new AppError("You should activate your account!", 403));
  
      const match = bcrypt.compareSync(password, user.password);
      console.log(match)
      if (!match) return next(new AppError("Invalid Password!", 401));
  
      const token = jwt.sign({ email, id: user._id }, process.env.TOKEN_SECRET as string);
  
      await Token.create({ token, user: user._id });

      return res.json({ success: true, results: token });
})

export const forgetCode = asyncHandler(async(req:Request ,res:Response,next:NextFunction)=>{
    const{email}:forgetCodeRequest = req.body

    const user = await User.findOne({ email });
    if (!user) return next(new AppError("Invalid Email!", 401))

    const forgetCode:string = Randomstring.generate({
        length: 6,    
        charset: 'numeric'  
    });

    user.forgetCode= forgetCode
     await user.save();


    const messageSent = await sendEmail({
        to: email,
        subject: "Reset Password",
        html: resetPasswordTemplate(forgetCode),
    });
    
    if (!messageSent) return next(new AppError("Something went wrong!", 401))

      return res.json({success:true,message:"Check your email!"})
}); 


export const resetPassword = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{
    const{email,password,forgetCode} :resetPasswordRequest = req.body

    const user = await User.findOne({ email });
    if (!user) return next(new AppError("Invalid Email!", 401))

    if(!user.isConfirmed)  return next(new AppError("Activate your account first!", 403))

    if(forgetCode!== user.forgetCode) return next(new AppError("Code is invalid!!", 401))
      
    user.password =bcrypt.hashSync(password,parseInt(process.env.SALT_ROUND as string))

    await user.save()

    const tokens = await Token.find({user:user._id})
    tokens.forEach(async(token)=>{
        token.isValid = false 
        await token.save()
    })
return res.json({ success: true, message: "Password updated successfully, please login again!" });
})