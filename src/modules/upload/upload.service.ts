import { Injectable, BadRequestException } from '@nestjs/common';
import {
  generatePostImageUploadUrl,
  generateEventImageUploadUrl,
} from '../../utils/presignedUrl';

@Injectable()
export class UploadService {
  async generatePostImageUploadUrl(userId: string, contentType: string) {
    return await generatePostImageUploadUrl(userId, contentType);
  }

  async generateEventImageUploadUrl(userId: string, contentType: string) {
    return await generateEventImageUploadUrl(userId, contentType);
  }
}
