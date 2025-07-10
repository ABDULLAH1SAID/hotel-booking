import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import { IRoom, RoomQueryParams} from "../../types/room.interfaces";
import { AppError } from "../../utils/appError";
import cloudinary from "../../utils/cloudUpload";
import { Room } from "../../DB/models/room.model";


export const createRoom = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, pricePerNight, roomType, capacity, amenities, isAvailable }: IRoom = req.body;
  let images = [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    for (const file of req.files) {
      try{
      const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
        folder: `${process.env.CLOUD_FOLDER_NAME}/room/photos`
      });
      images.push({
        url: secure_url,
        id: public_id
      });
    }
    catch(erro){
      return next(new AppError("Failed to upload image", 500));
    };
    
  }

  }

  const newRoom = await Room.create({
    name,
    description,
    pricePerNight,
    roomType,
    capacity,
    amenities,
    isAvailable,
    images,
  });

  res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: newRoom,
  });
});


export const getRooms = asyncHandler(async (req: Request<{}, {}, {}, RoomQueryParams>, res: Response, next: NextFunction) =>{
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 4);
  const filters: any = {};

  if (req.query.roomType) {
    filters.roomType = req.query.roomType;
  }

  if (req.query.minPrice) {
    const minPrice = parseFloat(req.query.minPrice);
    if (!isNaN(minPrice)) {
      filters.pricePerNight = { ...filters.pricePerNight, $gte: minPrice };
    }
  }
  
  if (req.query.maxPrice) {
    const maxPrice = parseFloat(req.query.maxPrice);
    if (!isNaN(maxPrice)) {
      filters.pricePerNight = { ...filters.pricePerNight, $lte: maxPrice };
    }
  }
  if (req.query.isAvailable !== undefined) {
    filters.isAvailable = req.query.isAvailable === 'true';
  }

  const rooms = await Room.find(filters)
    .sort({ createdAt: -1 })
    .paginate(page, limit);

  const totalRooms = await Room.countDocuments(filters);
  const totalPages = Math.ceil(totalRooms / limit);
  
  res.status(200).json({
    success: true,
    currentPage: page,
    totalPages,
    totalRooms,       
    roomsInPage: rooms.length, 
    data: rooms,
  });
});

export const updateRoom = (async (req: Request, res: Response, next: NextFunction) => {
  const roomId = req.params.id;
  const room = await Room.findById(roomId);
  if (!room) return next(new AppError("Room not found", 404));

console.log(req.body.imagesToDelete)
  if (req.body.imagesToDelete && Array.isArray(req.body.imagesToDelete)) {
    console.log("enter successfully")
    for (const imageId of req.body.imagesToDelete) {
      try {
        await cloudinary.uploader.destroy(imageId);
        room.images = room.images.filter((image: any) => image.id !== imageId);
      } catch (error) {
        return next(new AppError("Failed to delete image", 500));
      }
    }
  }
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
          folder: `${process.env.CLOUD_FOLDER_NAME}/room/photos`
        });
        room.images.push({
          url: secure_url,
          id: public_id
        });
      } catch (error) {
        return next(new AppError("Failed to upload image", 500));
      }
    }
  }
  const updateData: Partial<IRoom> = req.body;
  console.log(updateData)
  Object.assign(room, updateData); 
  await room.save();

  res.status(200).json({
    success: true,
    message: "Room updated successfully",
    data: room,
  });
});

export const deleteRoom = (async (req: Request, res: Response, next: NextFunction) => {
  const roomId = req.params.id;
  const room = await Room.findById(roomId);
  if (!room) return next(new AppError("Room noasyncHandlert found", 404));
  if (room.images && Array.isArray(room.images)) {
    for (const image of room.images) {
      try {
        await cloudinary.uploader.destroy(image.id);
      } catch (error) {
        console.error(`Failed to delete image ${image.id} from Cloudinary`);
      }
    }
  }

  await room.deleteOne();

  res.status(200).json({
    success: true,
    message: "Room and all its images deleted successfully",
  });
});