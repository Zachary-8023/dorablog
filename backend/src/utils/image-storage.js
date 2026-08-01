import fs from "fs";
import path from "path";
import multer from "multer";
import { put } from "@vercel/blob";

function usesBlobStorage() {
  return Boolean(
    process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN
  );
}

function createDiskStorage(directory, prefix) {
  return multer.diskStorage({
    destination(req, file, callback) {
      const uploadDirectory = path.join(process.cwd(), "public", "uploads", directory);
      fs.mkdirSync(uploadDirectory, { recursive: true });
      callback(null, uploadDirectory);
    },
    filename(req, file, callback) {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      callback(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });
}

export function createImageUpload({ directory, prefix, maxSize }) {
  return multer({
    storage: usesBlobStorage() ? multer.memoryStorage() : createDiskStorage(directory, prefix),
    limits: { fileSize: maxSize },
    fileFilter(req, file, callback) {
      if (file.mimetype.startsWith("image/")) {
        callback(null, true);
      } else {
        callback(new Error("Only image files are allowed"), false);
      }
    }
  });
}

export async function persistUploadedImage(file, { directory, prefix }) {
  if (!file.buffer) {
    return {
      url: `/uploads/${directory}/${file.filename}`,
      filename: file.filename
    };
  }

  const extension = path.extname(file.originalname).toLowerCase();
  const pathname = `${directory}/${prefix}-${Date.now()}${extension}`;
  const blob = await put(pathname, file.buffer, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.mimetype
  });

  return {
    url: blob.url,
    filename: blob.pathname.split("/").pop()
  };
}
