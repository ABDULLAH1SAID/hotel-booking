import { Router } from "express";
import express from "express"
const router = Router();

import  { mainWebhook, updateWebhook} from "./webhook.controller";
router.post("/Stripe", express.raw({ type: "application/json" }), mainWebhook);
router.patch("/updateAfterPay", express.raw({ type: "application/json" }), updateWebhook);

export default router;