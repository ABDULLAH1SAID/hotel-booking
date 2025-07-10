import { Request } from "express";

export interface AuthenticatedRequest extends Request {
    user?: any
}

export type Role = "user" | "admin";
