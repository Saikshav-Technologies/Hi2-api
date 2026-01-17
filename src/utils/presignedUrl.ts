import { generatePresignedUploadUrl } from './s3';
import { AppError } from './errors';

/**
 * Generate presigned URL for post image uploads
 */
export async function generatePostImageUploadUrl(
  userId: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string }> {
  if (!contentType.startsWith('image/')) {
    throw new AppError(400, 'Content type must be an image');
  }

  const key = `posts/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const uploadUrl = await generatePresignedUploadUrl(key, contentType, 3600); // 1 hour expiry

  return {
    uploadUrl,
    key,
  };
}

/**
 * Generate presigned URL for event image uploads
 */
export async function generateEventImageUploadUrl(
  userId: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string }> {
  if (!contentType.startsWith('image/')) {
    throw new AppError(400, 'Content type must be an image');
  }

  const key = `events/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const uploadUrl = await generatePresignedUploadUrl(key, contentType, 3600); // 1 hour expiry

  return {
    uploadUrl,
    key,
  };
}
