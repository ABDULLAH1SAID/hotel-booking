"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer_1.default.createTransport({
        host: 'localhost',
        service: 'gmail',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    });
    const info = await transporter.sendMail({
        from: `"hotel Aplication" <${process.env.EMAIL}>`,
        to,
        subject,
        html,
    });
    if (info.rejected.length > 0)
        return false;
    return true;
};
exports.sendEmail = sendEmail;
