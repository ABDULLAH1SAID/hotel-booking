"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResetPasswordTemplate = exports.generateSignUpTemplate = exports.resetPasswordTemplate = exports.signUpTemplate = void 0;
const signUpTemplate = (confirmationLink) => `
<!DOCTYPE html>
<html>
<head>
    <title>Activate Your Account</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            color: #333;
            text-align: center;
            padding: 40px 20px;
            margin: 0;
            line-height: 1.6;
        }
        .container {
            background-color: #ffffff;
            border: 1px solid #e1e5e9;
            border-radius: 12px;
            padding: 30px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c3e50;
            font-size: 28px;
            margin: 0;
            font-weight: 600;
        }
        .content {
            margin-bottom: 30px;
        }
        .content p {
            font-size: 16px;
            color: #555;
            margin: 15px 0;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 16px;
            font-weight: 600;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e1e5e9;
            font-size: 12px;
            color: #888;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 20px;
                margin: 10px;
            }
            .btn {
                padding: 12px 25px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome! Activate Your Account</h1>
        </div>
        
        <div class="content">
            <p>Thank you for joining us! We're excited to have you on board.</p>
            <p>To get started, please activate your account by clicking the button below:</p>
            <a href="${confirmationLink}" class="btn">
                🚀 Activate My Account
            </a>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in 24 hours for your security.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea; font-size: 14px;">
                ${confirmationLink}
            </p>
        </div>
        
        <div class="footer">
            <p>If you didn't create an account with us, please ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
exports.signUpTemplate = signUpTemplate;
const resetPasswordTemplate = (resetCode) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset Request</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header .icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .content {
            padding: 30px;
            text-align: center;
        }
        .content h2 {
            color: #2c3e50;
            font-size: 24px;
            margin: 0 0 20px 0;
        }
        .content p {
            color: #555;
            font-size: 16px;
            margin: 15px 0;
        }
        .code-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            font-weight: bold;
            font-size: 32px;
            padding: 20px;
            border-radius: 8px;
            display: inline-block;
            margin: 20px 0;
            letter-spacing: 4px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            min-width: 200px;
        }
        .warning-box {
            background-color: #ffeaa7;
            border: 1px solid #fdcb6e;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            color: #2d3436;
        }
        .warning-box strong {
            color: #e17055;
        }
        .security-tips {
            background-color: #e8f4f8;
            border-left: 4px solid #00b894;
            padding: 20px;
            margin: 25px 0;
            text-align: left;
        }
        .security-tips h3 {
            color: #00b894;
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        .security-tips ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .security-tips li {
            margin: 8px 0;
            color: #2d3436;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            font-size: 12px;
            color: #6c757d;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 20px;
            }
            .code-container {
                font-size: 24px;
                padding: 15px;
                letter-spacing: 2px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="icon">🔐</div>
            <h1>Password Reset Request</h1>
        </div>
        
        <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Use the verification code below:</p>
            
            <div class="code-container">
                ${resetCode}
            </div>
            
            <div class="warning-box">
                <strong>⏰ Important:</strong> This code will expire in <strong>15 minutes</strong> for your security.
            </div>
            
            <div class="security-tips">
                <h3>🛡️ Security Tips:</h3>
                <ul>
                    <li>Never share this code with anyone</li>
                    <li>We will never ask for this code via phone or email</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Consider using a strong, unique password</li>
                </ul>
            </div>
            
            <p>Enter this code on the password reset page to create your new password.</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            <p>If you have questions, contact our support team.</p>
        </div>
    </div>
</body>
</html>
`;
exports.resetPasswordTemplate = resetPasswordTemplate;
// Interface للـ email options (إختياري)
const generateSignUpTemplate = (confirmationLink, options = {}) => {
    const { companyName = 'Your Company Name', supportEmail = 'support@yourcompany.com' } = options;
    return (0, exports.signUpTemplate)(confirmationLink).replace('Your Company Name', companyName);
};
exports.generateSignUpTemplate = generateSignUpTemplate;
const generateResetPasswordTemplate = (resetCode, options = {}) => {
    const { companyName = 'Your Company Name' } = options;
    return (0, exports.resetPasswordTemplate)(resetCode).replace('Your Company Name', companyName);
};
exports.generateResetPasswordTemplate = generateResetPasswordTemplate;
