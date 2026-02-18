// src/middleware/upload.middleware.ts

import multer, { FileFilterCallback, MulterError } from 'multer';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { HTTP_STATUS } from '../config/constants';

// ============= Configuration =============

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB default

// ============= File Filters =============

const resumeFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOC/DOCX files are allowed.'));
  }
};

const imageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

const audioFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP3, WAV, and WebM audio files are allowed.'));
  }
};

// ============= Multer Configurations =============

const storage = multer.memoryStorage();

// Resume upload
export const uploadResume: RequestHandler = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: resumeFilter,
}).single('resume');

// Image upload
export const uploadImage: RequestHandler = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: imageFilter,
}).single('image');

// Audio upload
export const uploadAudio: RequestHandler = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE * 2, // 10MB for audio
    files: 1,
  },
  fileFilter: audioFilter,
}).single('audio');

// Multiple images
export const uploadImages: RequestHandler = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
  fileFilter: imageFilter,
}).array('images', 5);

// ============= Error Handler Wrapper =============

export const handleUpload = (uploadMiddleware: RequestHandler): RequestHandler => {
  const wrapped: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
    uploadMiddleware(req, res, (error: unknown) => {
      if (error) {
        if (error instanceof MulterError) {
          let message = 'File upload error';

          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              message = `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`;
              break;
            case 'LIMIT_FILE_COUNT':
              message = 'Too many files';
              break;
            case 'LIMIT_UNEXPECTED_FILE':
              message = 'Unexpected field name';
              break;
            default:
              message = error.message;
          }

          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: message,
          });
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : 'File upload failed';
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: errorMessage,
        });
        return;
      }

      next();
    });
  };

  return wrapped;
};

// ============= Middleware Exports =============

export const resourceUpload: RequestHandler = handleUpload(
  multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1,
    },
    fileFilter: resumeFilter, // Reuse PDF/DOC filter
  }).single('file')
);

export const resumeUpload: RequestHandler = handleUpload(uploadResume);
export const imageUpload: RequestHandler = handleUpload(uploadImage);
export const audioUpload: RequestHandler = handleUpload(uploadAudio);
export const imagesUpload: RequestHandler = handleUpload(uploadImages);
