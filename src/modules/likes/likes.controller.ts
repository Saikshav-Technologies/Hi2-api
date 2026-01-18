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
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('api')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('posts/:postId/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async toggleLike(@Param('postId') postId: string, @CurrentUser() user: User) {
    const result = await this.likesService.toggleLike(postId, user.id);
    return {
      success: true,
      data: result,
    };
  }

  @Get('posts/:postId/likes')
  async getPostLikes(
    @Param('postId') postId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    const result = await this.likesService.getPostLikes(postId, page, limit);
    return {
      success: true,
      data: result,
    };
  }
}
