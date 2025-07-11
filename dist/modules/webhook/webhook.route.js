"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const router = (0, express_1.Router)();
const webhook_controller_1 = require("./webhook.controller");
router.post("/Stripe", express_2.default.raw({ type: "application/json" }), webhook_controller_1.mainWebhook);
router.patch("/updateAfterPay", express_2.default.raw({ type: "application/json" }), webhook_controller_1.updateWebhook);
exports.default = router;
