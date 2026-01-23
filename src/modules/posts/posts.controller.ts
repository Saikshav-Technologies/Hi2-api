import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(@CurrentUser() user: User, @Body() createPostDto: CreatePostDto) {
    const post = await this.postsService.createPost(
      user.id,
      createPostDto.caption,
      createPostDto.mediaUrls,
      createPostDto.idempotencyKey
    );
    return {
      success: true,
      data: post,
    };
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async getPosts(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @CurrentUser() user?: User
  ) {
    const result = await this.postsService.getPosts(page, limit, user?.id);
    return {
      success: true,
      data: result,
    };
  }

  @Get(':postId')
  @UseGuards(OptionalAuthGuard)
  async getPost(@Param('postId') postId: string, @CurrentUser() user?: User) {
    const post = await this.postsService.getPost(postId, user?.id);
    return {
      success: true,
      data: post,
    };
  }

  @Put(':postId')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param('postId') postId: string,
    @CurrentUser() user: User,
    @Body() updatePostDto: UpdatePostDto
  ) {
    const post = await this.postsService.updatePost(postId, user.id, updatePostDto.caption);
    return {
      success: true,
      data: post,
    };
  }

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deletePost(@Param('postId') postId: string, @CurrentUser() user: User) {
    await this.postsService.deletePost(postId, user.id);
    return {
      success: true,
      message: 'Post deleted successfully',
    };
  }
}
