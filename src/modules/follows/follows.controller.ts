import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('api')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post('users/:userId/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async toggleFollow(@Param('userId') userId: string, @CurrentUser() user: User) {
    const result = await this.followsService.toggleFollow(user.id, userId);
    return {
      success: true,
      data: result,
    };
  }

  @Get('users/:userId/followers')
  async getFollowers(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    const result = await this.followsService.getFollowers(userId, page, limit);
    return {
      success: true,
      data: result,
    };
  }

  @Get('users/:userId/following')
  async getFollowing(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    const result = await this.followsService.getFollowing(userId, page, limit);
    return {
      success: true,
      data: result,
    };
  }
}
