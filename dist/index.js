"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connect_1 = __importDefault(require("./DB/connect"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_route_1 = __importDefault(require("./modules/auth/auth.route"));
const user_route_1 = __importDefault(require("./modules/user/user.route"));
const room_route_1 = __importDefault(require("./modules/room/room.route"));
const Booking_route_1 = __importDefault(require("./modules/Booking/Booking.route"));
const webhook_route_1 = __importDefault(require("./modules/webhook/webhook.route"));
dotenv_1.default.config();
const port = process.env.PORT ? Number(process.env.PORT) : 5000;
const app = (0, express_1.default)();
(0, connect_1.default)();
// Importing the webhook router
app.use('/webhook', webhook_route_1.default);
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, hpp_1.default)());
app.use((0, morgan_1.default)("dev"));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
});
app.use(limiter);
// Global middleware: logs request method and URL
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});
app.get('/success', (req, res) => {
    res.send(' الدفع تم بنجاح! شكراً ليك.');
});
app.get('/cancel', (req, res) => {
    res.send(' تم إلغاء العملية. حاول مرة أخرى.');
});
app.use('/auth', auth_route_1.default);
app.use('/user', user_route_1.default);
app.use('/room', room_route_1.default);
app.use('/Booking', Booking_route_1.default);
app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    console.log(statusCode);
    res.status(statusCode).json({
        success: false,
        message: error.message,
        stack: error.stack,
    });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
