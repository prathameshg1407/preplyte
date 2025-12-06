"use strict";
// src/utils/cloudinary.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.getUsage = exports.testConnection = exports.isConfigured = exports.getSignedUrl = exports.getOptimizedUrl = exports.deleteFiles = exports.deleteFile = exports.uploadImage = exports.uploadAudio = exports.uploadResume = exports.uploadFromUrl = exports.uploadBuffer = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const stream_1 = require("stream");
// ============= Configuration =============
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// ============= Upload Functions =============
/**
 * Upload file buffer to Cloudinary
 */
const uploadBuffer = async (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: options.folder || 'uploads',
            resource_type: options.resourceType || 'auto',
            format: options.format,
            public_id: options.publicId,
            overwrite: options.overwrite ?? true,
            transformation: options.transformation,
        }, (error, result) => {
            if (error) {
                console.error('[Cloudinary] Upload error:', error);
                reject(new Error(`Cloudinary upload failed: ${error.message}`));
                return;
            }
            if (!result) {
                reject(new Error('Cloudinary upload failed: No result returned'));
                return;
            }
            resolve({
                publicId: result.public_id,
                url: result.url,
                secureUrl: result.secure_url,
                format: result.format,
                resourceType: result.resource_type,
                bytes: result.bytes,
                width: result.width,
                height: result.height,
                duration: result.duration,
            });
        });
        // Convert buffer to stream and pipe to upload
        const readableStream = new stream_1.Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};
exports.uploadBuffer = uploadBuffer;
/**
 * Upload file from URL to Cloudinary
 */
const uploadFromUrl = async (url, options = {}) => {
    try {
        const result = await cloudinary_1.v2.uploader.upload(url, {
            folder: options.folder || 'uploads',
            resource_type: options.resourceType || 'auto',
            format: options.format,
            public_id: options.publicId,
            overwrite: options.overwrite ?? true,
        });
        return {
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            format: result.format,
            resourceType: result.resource_type,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            duration: result.duration,
        };
    }
    catch (error) {
        console.error('[Cloudinary] Upload from URL error:', error);
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};
exports.uploadFromUrl = uploadFromUrl;
/**
 * Upload resume (PDF/DOC)
 */
const uploadResume = async (buffer, fileName, userId) => {
    const publicId = `${userId}/${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`;
    return (0, exports.uploadBuffer)(buffer, {
        folder: 'resumes',
        resourceType: 'raw',
        publicId,
    });
};
exports.uploadResume = uploadResume;
/**
 * Upload audio file (MP3)
 */
const uploadAudio = async (buffer, sessionId) => {
    const publicId = `${sessionId}_${Date.now()}`;
    return (0, exports.uploadBuffer)(buffer, {
        folder: 'audio',
        resourceType: 'video', // Cloudinary uses 'video' for audio files
        format: 'mp3',
        publicId,
    });
};
exports.uploadAudio = uploadAudio;
/**
 * Upload image
 */
const uploadImage = async (buffer, options = {}) => {
    return (0, exports.uploadBuffer)(buffer, {
        folder: 'images',
        resourceType: 'image',
        ...options,
    });
};
exports.uploadImage = uploadImage;
// ============= Delete Functions =============
/**
 * Delete file from Cloudinary
 */
const deleteFile = async (publicId, resourceType = 'raw') => {
    try {
        const result = await cloudinary_1.v2.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
        console.log(`[Cloudinary] Deleted ${publicId}:`, result);
        return result.result === 'ok';
    }
    catch (error) {
        console.error('[Cloudinary] Delete error:', error);
        throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
};
exports.deleteFile = deleteFile;
/**
 * Delete multiple files
 */
const deleteFiles = async (publicIds, resourceType = 'raw') => {
    try {
        await cloudinary_1.v2.api.delete_resources(publicIds, {
            resource_type: resourceType,
        });
        console.log(`[Cloudinary] Deleted ${publicIds.length} files`);
    }
    catch (error) {
        console.error('[Cloudinary] Bulk delete error:', error);
        throw new Error(`Cloudinary bulk delete failed: ${error.message}`);
    }
};
exports.deleteFiles = deleteFiles;
// ============= URL Generation =============
/**
 * Get optimized URL for a file
 */
const getOptimizedUrl = (publicId, options = {}) => {
    return cloudinary_1.v2.url(publicId, {
        secure: true,
        transformation: [
            {
                width: options.width,
                height: options.height,
                crop: 'limit',
                quality: options.quality || 'auto',
                fetch_format: options.format || 'auto',
            },
        ],
    });
};
exports.getOptimizedUrl = getOptimizedUrl;
/**
 * Get signed URL for private files
 */
const getSignedUrl = (publicId, expiresAt) => {
    return cloudinary_1.v2.url(publicId, {
        secure: true,
        sign_url: true,
        type: 'authenticated',
        expires_at: expiresAt || Math.floor(Date.now() / 1000) + 3600, // 1 hour default
    });
};
exports.getSignedUrl = getSignedUrl;
// ============= Utility Functions =============
/**
 * Check if Cloudinary is configured
 */
const isConfigured = () => {
    return !!(process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET);
};
exports.isConfigured = isConfigured;
/**
 * Test Cloudinary connection
 */
const testConnection = async () => {
    try {
        const result = await cloudinary_1.v2.api.ping();
        console.log('[Cloudinary] ✅ Connection successful:', result);
        return true;
    }
    catch (error) {
        console.error('[Cloudinary] ❌ Connection failed:', error);
        return false;
    }
};
exports.testConnection = testConnection;
/**
 * Get account usage
 */
const getUsage = async () => {
    try {
        return await cloudinary_1.v2.api.usage();
    }
    catch (error) {
        console.error('[Cloudinary] Get usage error:', error);
        throw new Error(`Failed to get Cloudinary usage: ${error.message}`);
    }
};
exports.getUsage = getUsage;
exports.default = {
    uploadBuffer: exports.uploadBuffer,
    uploadFromUrl: exports.uploadFromUrl,
    uploadResume: exports.uploadResume,
    uploadAudio: exports.uploadAudio,
    uploadImage: exports.uploadImage,
    deleteFile: exports.deleteFile,
    deleteFiles: exports.deleteFiles,
    getOptimizedUrl: exports.getOptimizedUrl,
    getSignedUrl: exports.getSignedUrl,
    isConfigured: exports.isConfigured,
    testConnection: exports.testConnection,
    getUsage: exports.getUsage,
};
//# sourceMappingURL=cloudinary.js.map