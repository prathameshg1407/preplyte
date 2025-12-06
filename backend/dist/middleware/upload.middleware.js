"use strict";
// src/middleware/upload.middleware.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.imagesUpload = exports.audioUpload = exports.imageUpload = exports.resumeUpload = exports.handleUpload = exports.uploadImages = exports.uploadAudio = exports.uploadImage = exports.uploadResume = void 0;
const multer_1 = __importStar(require("multer"));
const constants_1 = require("../config/constants");
// ============= Configuration =============
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB default
// ============= File Filters =============
const resumeFilter = (_req, file, cb) => {
    const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only PDF and DOC/DOCX files are allowed.'));
    }
};
const imageFilter = (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
};
const audioFilter = (_req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only MP3, WAV, and WebM audio files are allowed.'));
    }
};
// ============= Multer Configurations =============
const storage = multer_1.default.memoryStorage();
// Resume upload
exports.uploadResume = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
    },
    fileFilter: resumeFilter,
}).single('resume');
// Image upload
exports.uploadImage = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
    },
    fileFilter: imageFilter,
}).single('image');
// Audio upload
exports.uploadAudio = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE * 2, // 10MB for audio
        files: 1,
    },
    fileFilter: audioFilter,
}).single('audio');
// Multiple images
exports.uploadImages = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 5,
    },
    fileFilter: imageFilter,
}).array('images', 5);
// ============= Error Handler Wrapper =============
const handleUpload = (uploadMiddleware) => {
    const wrapped = (req, res, next) => {
        uploadMiddleware(req, res, (error) => {
            if (error) {
                if (error instanceof multer_1.MulterError) {
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
                    res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
                        success: false,
                        error: message,
                    });
                    return;
                }
                const errorMessage = error instanceof Error ? error.message : 'File upload failed';
                res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
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
exports.handleUpload = handleUpload;
// ============= Middleware Exports =============
exports.resumeUpload = (0, exports.handleUpload)(exports.uploadResume);
exports.imageUpload = (0, exports.handleUpload)(exports.uploadImage);
exports.audioUpload = (0, exports.handleUpload)(exports.uploadAudio);
exports.imagesUpload = (0, exports.handleUpload)(exports.uploadImages);
//# sourceMappingURL=upload.middleware.js.map