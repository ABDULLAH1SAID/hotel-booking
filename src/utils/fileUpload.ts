import multer, { diskStorage, FileFilterCallback } from "multer";
import {  Request } from "express"


export const fileUpload = () => {
  console.log(diskStorage)
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (!["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"));
    }
    cb(null, true);
  };
  return multer({ storage: diskStorage({}), fileFilter });
};
