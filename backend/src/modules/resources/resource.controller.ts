import type { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { resourceService } from "./resource.service.js";
import {
  createResourceSchema,
  updateResourceSchema,
  queryResourceSchema,
} from "./resource.schema.js";
import { NotFoundError } from "../../common/errors/app-error.js";

export const createResourceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createResourceSchema.parse(req.body);
    const resource = await resourceService.createResource(
      req.user!,
      req.file,
      validatedData
    );

    res.status(201).json({
      success: true,
      message: "Resource uploaded successfully",
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

export const listResourcesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = queryResourceSchema.parse(req.query);
    const result = await resourceService.listResources(req.user!, query);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getResourceByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const resource = await resourceService.getResourceById(req.user!, id);

    res.json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

export const getDownloadUrlHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const downloadData = await resourceService.getDownloadUrl(req.user!, id);

    res.json({
      success: true,
      data: downloadData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateResourceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const validatedData = updateResourceSchema.parse(req.body);
    const updated = await resourceService.updateResource(req.user!, id, validatedData);

    res.json({
      success: true,
      message: "Resource updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResourceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const result = await resourceService.deleteResource(req.user!, id);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to serve local resource files safely when STORAGE_DRIVER=local
 */
export const serveLocalResourceFileHandler = (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename as string);
  const filePath = path.resolve(process.cwd(), "uploads", "resources", filename);

  if (!fs.existsSync(filePath)) {
    throw new NotFoundError("File not found on local storage");
  }

  res.sendFile(filePath);
};
