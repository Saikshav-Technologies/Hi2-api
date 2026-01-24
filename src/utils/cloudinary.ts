import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env';
import { AppError } from './errors';

let isConfigured = false;

/**
 * Configure Cloudinary with credentials from environment variables
 */
export function configureCloudinary() {
  if (isConfigured) {
    return;
  }

  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    throw new AppError(500, 'Cloudinary configuration is missing');
  }

  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });

  isConfigured = true;
}

/**
 * Generate Cloudinary upload signature and parameters
 */
export function generateCloudinaryUploadSignature(
  folder: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  resourceType: string;
} {
  configureCloudinary();

  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp,
    folder,
    resource_type: resourceType,
  };

  const signature = cloudinary.utils.api_sign_request(params, config.cloudinary.apiSecret);

  return {
    signature,
    timestamp,
    cloudName: config.cloudinary.cloudName,
    apiKey: config.cloudinary.apiKey,
    folder,
    resourceType,
  };
}

/**
 * Generate upload signature for post images
 */
export function generatePostImageCloudinarySignature(userId: string) {
  const folder = `posts/${userId}`;
  return generateCloudinaryUploadSignature(folder, 'image');
}

/**
 * Generate upload signature for event images
 */
export function generateEventImageCloudinarySignature(userId: string) {
  const folder = `events/${userId}`;
  return generateCloudinaryUploadSignature(folder, 'image');
}

/**
 * Delete an image from Cloudinary by public_id
 */
export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  configureCloudinary();

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new AppError(500, `Failed to delete image from Cloudinary: ${error.message}`);
  }
}

/**
 * Get Cloudinary image URL with transformations
 */
export function getCloudinaryImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
  }
): string {
  configureCloudinary();

  return cloudinary.url(publicId, {
    ...options,
    secure: true,
  });
}

/**
 * Upload image buffer directly to Cloudinary
 */
export async function uploadImageToCloudinary(
  imageBuffer: Buffer,
  folder: string,
  options?: {
    resourceType?: 'image' | 'video' | 'raw';
    format?: string;
  }
): Promise<{
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
}> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: options?.resourceType || 'image',
        format: options?.format,
      },
      (error, result) => {
        if (error) {
          reject(new AppError(500, `Failed to upload to Cloudinary: ${error.message}`));
        } else {
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            resourceType: result.resource_type,
          });
        }
      }
    );

    uploadStream.end(imageBuffer);
  });
}

/**
 * Upload post image directly to Cloudinary
 */
export async function uploadPostImageToCloudinary(userId: string, imageBuffer: Buffer) {
  const folder = `posts/${userId}`;
  return uploadImageToCloudinary(imageBuffer, folder, { resourceType: 'image' });
}

/**
 * Upload event image directly to Cloudinary
 */
export async function uploadEventImageToCloudinary(userId: string, imageBuffer: Buffer) {
  const folder = `events/${userId}`;
  return uploadImageToCloudinary(imageBuffer, folder, { resourceType: 'image' });
}
/**
 * Get image metadata from Cloudinary by public_id
 */
export async function getCloudinaryImageMetadata(publicId: string): Promise<{
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
  bytes: number;
  createdAt: string;
  etag: string;
  folder: string;
}> {
  configureCloudinary();

  try {
    const resource = await cloudinary.api.resource(publicId);
    return {
      publicId: resource.public_id,
      url: resource.url,
      secureUrl: resource.secure_url,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      resourceType: resource.resource_type,
      bytes: resource.bytes,
      createdAt: resource.created_at,
      etag: resource.etag,
      folder: resource.folder,
    };
  } catch (error) {
    throw new AppError(404, `Image not found: ${error.message}`);
  }
}

/**
 * List all images in a folder
 */
export async function listCloudinaryImages(
  folder: string,
  options?: { maxResults?: number }
): Promise<
  Array<{
    publicId: string;
    url: string;
    secureUrl: string;
    width: number;
    height: number;
    format: string;
    createdAt: string;
  }>
> {
  configureCloudinary();

  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: options?.maxResults || 100,
    });

    return result.resources.map((resource) => ({
      publicId: resource.public_id,
      url: resource.url,
      secureUrl: resource.secure_url,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      createdAt: resource.created_at,
    }));
  } catch (error) {
    throw new AppError(500, `Failed to list images: ${error.message}`);
  }
}

/**
 * Delete image from Cloudinary by public_id
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  configureCloudinary();

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok') {
      throw new AppError(400, `Failed to delete image: ${result.result}`);
    }
  } catch (error) {
    throw new AppError(500, `Failed to delete image from Cloudinary: ${error.message}`);
  }
}

/**
 * Get all images for a user (posts)
 */
export async function getUserPostImages(userId: string, options?: { maxResults?: number }) {
  const folder = `posts/${userId}`;
  return listCloudinaryImages(folder, options);
}

/**
 * Get all images for an event
 */
export async function getEventImages(userId: string, options?: { maxResults?: number }) {
  const folder = `events/${userId}`;
  return listCloudinaryImages(folder, options);
}
/**
 * Upload avatar image directly to Cloudinary
 */
export async function uploadAvatarToCloudinary(userId: string, imageBuffer: Buffer) {
  configureCloudinary();

  return new Promise<{
    url: string;
    secureUrl: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    resourceType: string;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `avatars`,
        resource_type: 'image',
        public_id: `avatar-${userId}`, // Fixed ID so it overwrites previous avatar
        overwrite: true, // Replace existing avatar
      },
      (error, result) => {
        if (error) {
          reject(new AppError(500, `Failed to upload avatar to Cloudinary: ${error.message}`));
        } else {
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            resourceType: result.resource_type,
          });
        }
      }
    );

    uploadStream.end(imageBuffer);
  });
}

/**
 * Get avatar image for a specific user
 */
export async function getAvatarImageUrl(userId: string): Promise<{
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
}> {
  configureCloudinary();

  try {
    const publicId = `avatars/avatar-${userId}`;
    const resource = await cloudinary.api.resource(publicId);
    return {
      url: resource.url,
      secureUrl: resource.secure_url,
      publicId: resource.public_id,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      createdAt: resource.created_at,
    };
  } catch (error) {
    throw new AppError(404, `Avatar not found for user ${userId}`);
  }
}

/**
 * Delete avatar image for a user
 */
export async function deleteAvatarFromCloudinary(userId: string): Promise<void> {
  configureCloudinary();

  try {
    const publicId = `avatars/avatar-${userId}`;
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new AppError(400, `Failed to delete avatar: ${result.result}`);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, `Failed to delete avatar from Cloudinary: ${error.message}`);
  }
}
