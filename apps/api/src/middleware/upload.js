import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { extname, join } from "node:path";

import multer from "multer";

import { env } from "../config/env.js";
import { createHttpError } from "../utils/httpError.js";

const ensureDirectory = (folderName) => {
  const target = join(env.uploadsDir, folderName);
  mkdirSync(target, { recursive: true });
  return target;
};

const createStorage = (folderName) =>
  multer.diskStorage({
    destination: (_request, _file, callback) => {
      callback(null, ensureDirectory(folderName));
    },
    filename: (_request, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname) || ".jpg"}`);
    }
  });

const createFileFilter = (allowedMimeTypes) => (request, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    callback(createHttpError(400, "Unsupported file type."));
    return;
  }

  callback(null, true);
};

export const productImageUpload = multer({
  storage: createStorage("products"),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: createFileFilter(["image/jpeg", "image/png", "image/webp"])
});

export const verificationUpload = multer({
  storage: createStorage("verification"),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: createFileFilter(["image/jpeg", "image/png", "application/pdf"])
});

