import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AvatarUploadDto } from './dto/avatar-upload.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId')
  @UseGuards(OptionalAuthGuard)
  async getProfile(@Param('userId') userId: string, @CurrentUser() currentUser?: User) {
    const profile = await this.usersService.getProfile(userId, currentUser?.id);
    return {
      success: true,
      data: profile,
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@CurrentUser() user: User, @Body() updateProfileDto: UpdateProfileDto) {
    const profile = await this.usersService.updateProfile(user.id, {
      ...updateProfileDto,
      birthday: updateProfileDto.birthday ? new Date(updateProfileDto.birthday) : undefined,
    });
    return {
      success: true,
      data: profile,
    };
  }

  @Post('avatar/upload-url')
  @UseGuards(JwtAuthGuard)
  async generateAvatarUploadUrl(@CurrentUser() user: User, @Body() dto: AvatarUploadDto) {
    const result = await this.usersService.generateAvatarUploadUrl(user.id, dto.contentType);
    return {
      success: true,
      data: result,
    };
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  async updateAvatar(@CurrentUser() user: User, @Body() dto: UpdateAvatarDto) {
    const profile = await this.usersService.updateAvatar(user.id, dto.key);
    return {
      success: true,
      data: profile,
    };
  }

  @Get('avatar/presigned-url')
  async getAvatarUrl(@Query('key') key: string) {
    console.log('Received key:', key);
    if (!key) {
      throw new BadRequestException('Key query parameter is required');
    }
    const url = await this.usersService.getAvatarUrl(key);
    return {
      success: true,
      data: { url },
    };
  }

  @Get(':userId/posts')
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10
  ) {
    const result = await this.usersService.getUserPosts(userId, page, limit);
    return {
      success: true,
      data: result,
    };
  }
}
