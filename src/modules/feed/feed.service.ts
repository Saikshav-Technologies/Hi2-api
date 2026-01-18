import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class FeedService {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly FEED_CACHE_PREFIX = 'feed:';

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getFeed(userId: string, page = 1, limit = 10) {
    // Check Redis cache first
    const cacheKey = `${this.FEED_CACHE_PREFIX}${userId}:${page}:${limit}`;
    const cached = await this.redis.getClient().get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Get user's following list
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    followingIds.push(userId); // Include own posts

    const skip = (page - 1) * limit;

    // Get posts from followed users
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          authorId: {
            in: followingIds,
          },
        },
        include: {
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
          likes: {
            where: { userId },
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({
        where: {
          authorId: {
            in: followingIds,
          },
        },
      }),
    ]);

    const result = {
      posts: posts.map((post) => ({
        ...post,
        isLiked: post.likes && post.likes.length > 0,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    await this.redis.getClient().setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));

    return result;
  }

  async invalidateFeedCache(userId: string) {
    // Invalidate all feed caches for this user and their followers
    const pattern = `${this.FEED_CACHE_PREFIX}${userId}:*`;
    const keys = await this.redis.getClient().keys(pattern);

    if (keys.length > 0) {
      await this.redis.getClient().del(...keys);
    }

    // Also invalidate caches for users who follow this user
    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      select: { followerId: true },
    });

    for (const follower of followers) {
      const followerPattern = `${this.FEED_CACHE_PREFIX}${follower.followerId}:*`;
      const followerKeys = await this.redis.getClient().keys(followerPattern);

      if (followerKeys.length > 0) {
        await this.redis.getClient().del(...followerKeys);
      }
    }
  }
}
