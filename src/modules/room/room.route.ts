import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { isAuthorized } from "../../middlewares/isAuthorized";
import { fileUpload } from "../../utils/fileUpload";
import * as roomSchema from "./room.validation"
import * as roomController  from "./room.controller"
import { validation } from "../../middlewares/validation";

const router = Router()

router.post("/", isAuthenticated,
     isAuthorized("admin"),
    fileUpload().array('images'),
     validation(roomSchema.createRoom),
     roomController.createRoom); 

  router.get("/", isAuthenticated,isAuthorized("admin"), roomController.getRooms);

  router.patch("/:id",isAuthenticated,
    isAuthorized("admin"),
    fileUpload().array('images'),
    validation(roomSchema.updateRoom), 
    roomController.updateRoom); 


   router.delete("/:id",isAuthenticated,
     isAuthorized("admin"),
     validation(roomSchema.deleteRoom), 
     roomController.deleteRoom)
     
export default router;