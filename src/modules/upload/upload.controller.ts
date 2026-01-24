import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadUrlDto } from './dto/upload-url.dto';
import { CloudinaryUploadDto } from './dto/cloudinary-upload.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('api')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  // S3 Upload Endpoints (Existing - Do Not Modify)
  @Post('posts/image/upload-url')
  @UseGuards(JwtAuthGuard)
  async generatePostImageUploadUrl(@CurrentUser() user: User, @Body() dto: UploadUrlDto) {
    const result = await this.uploadService.generatePostImageUploadUrl(user.id, dto.contentType);
    return {
      success: true,
      data: result,
    };
  }

  @Post('events/image/upload-url')
  @UseGuards(JwtAuthGuard)
  async generateEventImageUploadUrl(@CurrentUser() user: User, @Body() dto: UploadUrlDto) {
    const result = await this.uploadService.generateEventImageUploadUrl(user.id, dto.contentType);
    return {
      success: true,
      data: result,
    };
  }

  // Cloudinary Signature Endpoints (Client-side upload)
  @Post('posts/image/cloudinary-signature')
  @UseGuards(JwtAuthGuard)
  async generatePostImageCloudinarySignature(
    @CurrentUser() user: User,
    @Body() dto: CloudinaryUploadDto
  ) {
    const result = await this.uploadService.generatePostImageCloudinarySignature(user.id);
    return {
      success: true,
      data: result,
      message: 'Use these credentials to upload directly to Cloudinary from your client',
    };
  }

  @Post('events/image/cloudinary-signature')
  @UseGuards(JwtAuthGuard)
  async generateEventImageCloudinarySignature(
    @CurrentUser() user: User,
    @Body() dto: CloudinaryUploadDto
  ) {
    const result = await this.uploadService.generateEventImageCloudinarySignature(user.id);
    return {
      success: true,
      data: result,
      message: 'Use these credentials to upload directly to Cloudinary from your client',
    };
  }

  // Cloudinary Direct Upload Endpoints (Server-side upload - SIMPLE METHOD)
  @Post('posts/image/cloudinary-upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadPostImageToCloudinary(@CurrentUser() user: User, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }
    this.logger.log(
      `Uploading post image to Cloudinary for user ${user.id} with type ${file.mimetype}`
    );

    const result = await this.uploadService.uploadPostImageToCloudinary(user.id, file.buffer);

    this.logger.log(
      `Uploaded post image for user ${user.id} to publicId ${result.publicId} (format=${result.format}, width=${result.width}, height=${result.height})`
    );
    return {
      success: true,
      data: {
        url: result.secureUrl,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
      },
      message: 'Image uploaded successfully to Cloudinary',
    };
  }

  @Post('events/image/cloudinary-upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadEventImageToCloudinary(@CurrentUser() user: User, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    const result = await this.uploadService.uploadEventImageToCloudinary(user.id, file.buffer);
    return {
      success: true,
      data: {
        url: result.secureUrl,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
      },
      message: 'Image uploaded successfully to Cloudinary',
    };
  }

  // Cloudinary Retrieval Endpoints (GET methods)
  @Get('images/cloudinary/:publicId')
  @UseGuards(JwtAuthGuard)
  async getCloudinaryImageMetadata(@Param('publicId') publicId: string) {
    // Decode the publicId from URL (may be base64 encoded if it contains slashes)
    const decodedPublicId = Buffer.from(publicId, 'base64').toString('utf-8');

    const result = await this.uploadService.getImageMetadata(decodedPublicId);
    return {
      success: true,
      data: result,
    };
  }

  @Get('posts/images/list')
  @UseGuards(JwtAuthGuard)
  async listUserPostImages(@CurrentUser() user: User, @Query('maxResults') maxResults?: string) {
    const limit = maxResults ? Math.min(parseInt(maxResults), 100) : 50;
    const result = await this.uploadService.getUserPostImages(user.id, limit);
    return {
      success: true,
      data: result,
      total: result.length,
    };
  }

  @Get('events/images/list')
  @UseGuards(JwtAuthGuard)
  async listEventImages(@CurrentUser() user: User, @Query('maxResults') maxResults?: string) {
    const limit = maxResults ? Math.min(parseInt(maxResults), 100) : 50;
    const result = await this.uploadService.getEventImages(user.id, limit);
    return {
      success: true,
      data: result,
      total: result.length,
    };
  }

  // Cloudinary Deletion Endpoint
  @Delete('images/cloudinary/:publicId')
  @UseGuards(JwtAuthGuard)
  async deleteCloudinaryImage(@Param('publicId') publicId: string) {
    // Decode the publicId from URL (may be base64 encoded if it contains slashes)
    const decodedPublicId = Buffer.from(publicId, 'base64').toString('utf-8');

    await this.uploadService.deleteImage(decodedPublicId);
    return {
      success: true,
      message: `Image ${decodedPublicId} deleted successfully from Cloudinary`,
    };
  }

  // Avatar Upload Endpoint
  @Post('avatar/cloudinary-upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadAvatarToCloudinary(@CurrentUser() user: User, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    const result = await this.uploadService.uploadAvatarToCloudinary(user.id, file.buffer);
    return {
      success: true,
      data: {
        url: result.secureUrl,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
      },
      message: 'Avatar uploaded successfully to Cloudinary',
    };
  }

  // Get Avatar for Specific User
  @Get('avatar/:userId')
  async getUserAvatar(@Param('userId') userId: string) {
    const result = await this.uploadService.getAvatarImageUrl(userId);
    return {
      success: true,
      data: {
        url: result.secureUrl,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        createdAt: result.createdAt,
      },
    };
  }

  // Delete Avatar
  @Delete('avatar/cloudinary')
  @UseGuards(JwtAuthGuard)
  async deleteUserAvatar(@CurrentUser() user: User) {
    await this.uploadService.deleteAvatarFromCloudinary(user.id);
    return {
      success: true,
      message: 'Avatar deleted successfully from Cloudinary',
    };
  }
}
