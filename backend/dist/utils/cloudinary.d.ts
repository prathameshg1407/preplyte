import { v2 as cloudinary } from 'cloudinary';
export interface CloudinaryUploadResult {
    publicId: string;
    url: string;
    secureUrl: string;
    format: string;
    resourceType: string;
    bytes: number;
    width?: number;
    height?: number;
    duration?: number;
}
export interface CloudinaryUploadOptions {
    folder?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    format?: string;
    publicId?: string;
    overwrite?: boolean;
    transformation?: object[];
}
export type CloudinaryFolder = 'resumes' | 'audio' | 'images' | 'documents';
/**
 * Upload file buffer to Cloudinary
 */
export declare const uploadBuffer: (buffer: Buffer, options?: CloudinaryUploadOptions) => Promise<CloudinaryUploadResult>;
/**
 * Upload file from URL to Cloudinary
 */
export declare const uploadFromUrl: (url: string, options?: CloudinaryUploadOptions) => Promise<CloudinaryUploadResult>;
/**
 * Upload resume (PDF/DOC)
 */
export declare const uploadResume: (buffer: Buffer, fileName: string, userId: string) => Promise<CloudinaryUploadResult>;
/**
 * Upload audio file (MP3)
 */
export declare const uploadAudio: (buffer: Buffer, sessionId: string) => Promise<CloudinaryUploadResult>;
/**
 * Upload image
 */
export declare const uploadImage: (buffer: Buffer, options?: CloudinaryUploadOptions) => Promise<CloudinaryUploadResult>;
/**
 * Delete file from Cloudinary
 */
export declare const deleteFile: (publicId: string, resourceType?: "image" | "video" | "raw") => Promise<boolean>;
/**
 * Delete multiple files
 */
export declare const deleteFiles: (publicIds: string[], resourceType?: "image" | "video" | "raw") => Promise<void>;
/**
 * Get optimized URL for a file
 */
export declare const getOptimizedUrl: (publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
}) => string;
/**
 * Get signed URL for private files
 */
export declare const getSignedUrl: (publicId: string, expiresAt?: number) => string;
/**
 * Check if Cloudinary is configured
 */
export declare const isConfigured: () => boolean;
/**
 * Test Cloudinary connection
 */
export declare const testConnection: () => Promise<boolean>;
/**
 * Get account usage
 */
export declare const getUsage: () => Promise<object>;
export { cloudinary };
declare const _default: {
    uploadBuffer: (buffer: Buffer, options?: CloudinaryUploadOptions) => Promise<CloudinaryUploadResult>;
    uploadFromUrl: (url: string, options?: CloudinaryUploadOptions) => Promise<CloudinaryUploadResult>;
    uploadResume: (buffer: Buffer, fileName: string, userId: string) => Promise<CloudinaryUploadResult>;
    uploadAudio: (buffer: Buffer, sessionId: string) => Promise<CloudinaryUploadResult>;
    uploadImage: (buffer: Buffer, options?: CloudinaryUploadOptions) => Promise<CloudinaryUploadResult>;
    deleteFile: (publicId: string, resourceType?: "image" | "video" | "raw") => Promise<boolean>;
    deleteFiles: (publicIds: string[], resourceType?: "image" | "video" | "raw") => Promise<void>;
    getOptimizedUrl: (publicId: string, options?: {
        width?: number;
        height?: number;
        quality?: string | number;
        format?: string;
    }) => string;
    getSignedUrl: (publicId: string, expiresAt?: number) => string;
    isConfigured: () => boolean;
    testConnection: () => Promise<boolean>;
    getUsage: () => Promise<object>;
};
export default _default;
//# sourceMappingURL=cloudinary.d.ts.map