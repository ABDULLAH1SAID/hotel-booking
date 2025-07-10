import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';
import { EmailOptions } from "../types/sendEmail.interface"

export const sendEmail = async({to, subject, html}:EmailOptions)=>{

    const transporter:Transporter = nodemailer.createTransport({
        host:'localhost',
        service:'gmail',
        port: 465, 
        secure:true,
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASS
        }
    })

    const info:SentMessageInfo = await transporter.sendMail({
        from:`"hotel Aplication" <${process.env.EMAIL}>`,
        to,
        subject,
        html,
    }); 

    if(info.rejected.length>0) return false ;
    return true 
}