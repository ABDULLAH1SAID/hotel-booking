import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { isAuthorized } from "../../middlewares/isAuthorized";
import * as bookingController from "./Booking.controller";
import * as BookingSchema from "./Booking.validation";
import { validation } from "../../middlewares/validation";


const router = Router();

router.post("/", isAuthenticated, 
    validation(BookingSchema.createBooking),
 bookingController.createBooking);

router.delete("/:id", isAuthenticated,
     validation(BookingSchema.cancelBooking),
      bookingController.cancelBooking);

router.put("/:id", isAuthenticated,
    validation(BookingSchema.updateBooking),
    bookingController.updateBooking
)

export default router;
