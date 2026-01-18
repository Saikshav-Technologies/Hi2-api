import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadUrlDto } from './dto/upload-url.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('api')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

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
}
