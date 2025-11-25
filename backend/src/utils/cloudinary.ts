// src/utils/cloudinary.ts

import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

// ============= Configuration =============

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============= Types =============

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

// ============= Upload Functions =============

/**
 * Upload file buffer to Cloudinary
 */
export const uploadBuffer = async (
  buffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'uploads',
        resource_type: options.resourceType || 'auto',
        format: options.format,
        public_id: options.publicId,
        overwrite: options.overwrite ?? true,
        transformation: options.transformation,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
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
      }
    );

    // Convert buffer to stream and pipe to upload
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Upload file from URL to Cloudinary
 */
export const uploadFromUrl = async (
  url: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  try {
    const result = await cloudinary.uploader.upload(url, {
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
  } catch (error: any) {
    console.error('[Cloudinary] Upload from URL error:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Upload resume (PDF/DOC)
 */
export const uploadResume = async (
  buffer: Buffer,
  fileName: string,
  userId: string
): Promise<CloudinaryUploadResult> => {
  const publicId = `${userId}/${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`;
  
  return uploadBuffer(buffer, {
    folder: 'resumes',
    resourceType: 'raw',
    publicId,
  });
};

/**
 * Upload audio file (MP3)
 */
export const uploadAudio = async (
  buffer: Buffer,
  sessionId: string
): Promise<CloudinaryUploadResult> => {
  const publicId = `${sessionId}_${Date.now()}`;
  
  return uploadBuffer(buffer, {
    folder: 'audio',
    resourceType: 'video', // Cloudinary uses 'video' for audio files
    format: 'mp3',
    publicId,
  });
};

/**
 * Upload image
 */
export const uploadImage = async (
  buffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  return uploadBuffer(buffer, {
    folder: 'images',
    resourceType: 'image',
    ...options,
  });
};

// ============= Delete Functions =============

/**
 * Delete file from Cloudinary
 */
export const deleteFile = async (
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'raw'
): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    
    console.log(`[Cloudinary] Deleted ${publicId}:`, result);
    return result.result === 'ok';
  } catch (error: any) {
    console.error('[Cloudinary] Delete error:', error);
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

/**
 * Delete multiple files
 */
export const deleteFiles = async (
  publicIds: string[],
  resourceType: 'image' | 'video' | 'raw' = 'raw'
): Promise<void> => {
  try {
    await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });
    console.log(`[Cloudinary] Deleted ${publicIds.length} files`);
  } catch (error: any) {
    console.error('[Cloudinary] Bulk delete error:', error);
    throw new Error(`Cloudinary bulk delete failed: ${error.message}`);
  }
};

// ============= URL Generation =============

/**
 * Get optimized URL for a file
 */
export const getOptimizedUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
  } = {}
): string => {
  return cloudinary.url(publicId, {
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

/**
 * Get signed URL for private files
 */
export const getSignedUrl = (
  publicId: string,
  expiresAt?: number
): string => {
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    type: 'authenticated',
    expires_at: expiresAt || Math.floor(Date.now() / 1000) + 3600, // 1 hour default
  });
};

// ============= Utility Functions =============

/**
 * Check if Cloudinary is configured
 */
export const isConfigured = (): boolean => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Test Cloudinary connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await cloudinary.api.ping();
    console.log('[Cloudinary] ✅ Connection successful:', result);
    return true;
  } catch (error) {
    console.error('[Cloudinary] ❌ Connection failed:', error);
    return false;
  }
};

/**
 * Get account usage
 */
export const getUsage = async (): Promise<object> => {
  try {
    return await cloudinary.api.usage();
  } catch (error: any) {
    console.error('[Cloudinary] Get usage error:', error);
    throw new Error(`Failed to get Cloudinary usage: ${error.message}`);
  }
};

// Export cloudinary instance for advanced usage
export { cloudinary };

export default {
  uploadBuffer,
  uploadFromUrl,
  uploadResume,
  uploadAudio,
  uploadImage,
  deleteFile,
  deleteFiles,
  getOptimizedUrl,
  getSignedUrl,
  isConfigured,
  testConnection,
  getUsage,
};