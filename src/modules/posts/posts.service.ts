import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(userId: string, caption: string, mediaUrls: string[], idempotencyKey?: string) {
    const normalizedMediaUrls = Array.isArray(mediaUrls) ? mediaUrls : [];

    if (idempotencyKey) {
      const existing = await this.prisma.post.findUnique({
        where: { idempotencyKey },
        include: this.buildInclude(userId),
      });

      if (existing) {
        return this.attachIsLiked(existing, userId);
      }
    }

    const post = await this.prisma.post.create({
      data: {
        caption,
        mediaUrls: normalizedMediaUrls,
        authorId: userId,
        idempotencyKey,
      },
      include: this.buildInclude(userId),
    });

    return this.attachIsLiked(post, userId);
  }

  async getPost(postId: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: this.buildInclude(userId),
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    return this.attachIsLiked(post, userId);
  }

  async updatePost(postId: string, userId: string, caption: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('Not authorized to update this post');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: { caption },
      include: this.buildInclude(userId),
    });

    return this.attachIsLiked(updatedPost, userId);
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('Not authorized to delete this post');
    }

    await this.prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });
  }

  async getPosts(page = 1, limit = 10, userId?: string) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { deletedAt: null },
        include: this.buildInclude(userId),
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where: { deletedAt: null } }),
    ]);

    return {
      posts: posts.map((post) => this.attachIsLiked(post, userId)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private buildInclude(userId?: string): Prisma.PostInclude {
    return {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      ...(userId
        ? {
            likes: {
              where: { userId },
              select: { id: true },
            },
          }
        : {}),
    };
  }

  private attachIsLiked(post: any, userId?: string) {
    const { likes, ...rest } = post as { likes?: unknown[] } & Record<string, unknown>;
    if (!userId) {
      return { ...rest, isLiked: false };
    }

    const normalizedLikes = likes || [];
    return { ...rest, isLiked: Array.isArray(normalizedLikes) && normalizedLikes.length > 0 };
  }
}
