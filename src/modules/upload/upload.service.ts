import { Injectable, BadRequestException } from '@nestjs/common';
import { generatePostImageUploadUrl, generateEventImageUploadUrl } from '../../utils/presignedUrl';
import {
  generatePostImageCloudinarySignature,
  generateEventImageCloudinarySignature,
  uploadPostImageToCloudinary,
  uploadEventImageToCloudinary,
  getCloudinaryImageMetadata,
  listCloudinaryImages,
  deleteImageFromCloudinary,
  getUserPostImages,
  getEventImages,
  uploadAvatarToCloudinary,
  getAvatarImageUrl,
  deleteAvatarFromCloudinary,
} from '../../utils/cloudinary';

@Injectable()
export class UploadService {
  async generatePostImageUploadUrl(userId: string, contentType: string) {
    return await generatePostImageUploadUrl(userId, contentType);
  }

  async generateEventImageUploadUrl(userId: string, contentType: string) {
    return await generateEventImageUploadUrl(userId, contentType);
  }

  // Cloudinary signature methods (for client-side upload)
  async generatePostImageCloudinarySignature(userId: string) {
    return generatePostImageCloudinarySignature(userId);
  }

  async generateEventImageCloudinarySignature(userId: string) {
    return generateEventImageCloudinarySignature(userId);
  }

  // Cloudinary direct upload methods (server-side upload)
  async uploadPostImageToCloudinary(userId: string, imageBuffer: Buffer) {
    return await uploadPostImageToCloudinary(userId, imageBuffer);
  }

  async uploadEventImageToCloudinary(userId: string, imageBuffer: Buffer) {
    return await uploadEventImageToCloudinary(userId, imageBuffer);
  }

  // Cloudinary retrieval methods
  async getImageMetadata(publicId: string) {
    return await getCloudinaryImageMetadata(publicId);
  }

  async listImages(folder: string, maxResults?: number) {
    return await listCloudinaryImages(folder, { maxResults });
  }

  async getUserPostImages(userId: string, maxResults?: number) {
    return await getUserPostImages(userId, { maxResults });
  }

  async getEventImages(userId: string, maxResults?: number) {
    return await getEventImages(userId, { maxResults });
  }

  // Cloudinary deletion method
  async deleteImage(publicId: string) {
    return await deleteImageFromCloudinary(publicId);
  }

  // Avatar methods
  async uploadAvatarToCloudinary(userId: string, imageBuffer: Buffer) {
    return await uploadAvatarToCloudinary(userId, imageBuffer);
  }

  async getAvatarImageUrl(userId: string) {
    return await getAvatarImageUrl(userId);
  }

  async deleteAvatarFromCloudinary(userId: string) {
    return await deleteAvatarFromCloudinary(userId);
  }
}
