import { Router } from "express";
import express from "express"
const router = Router();

import  { mainWebhook, updateWebhook} from "./webhook.controller";
// this is the main webhook endpoint that handles Stripe events for booking and cancelation
router.post("/mainWebhook", express.raw({ type: "application/json" }), mainWebhook);
// this webhook endPOint for updating booking details after payment
router.patch("/updateAfterPay", express.raw({ type: "application/json" }), updateWebhook);

export default router;