import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { generatePresignedUploadUrl, generatePresignedGetUrl, getS3Url } from '../../utils/s3';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        avatarUrl: true,
        birthday: true,
        isPrivate: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If private profile and not the owner or following, hide some info
    if (user.isPrivate && currentUserId !== userId && currentUserId) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });

      if (!isFollowing) {
        return {
          ...user,
          email: undefined, // Hide email
        };
      }
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      username?: string;
      bio?: string;
      birthday?: Date;
      isPrivate?: boolean;
    }
  ) {
    if (data.username) {
      const existing = await this.prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existing && existing.id !== userId) {
        throw new ConflictException('Username already taken');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        avatarUrl: true,
        birthday: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateAvatar(userId: string, imageKey: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar if exists
    if (user.avatarUrl) {
      const oldKey = user.avatarUrl.split('/').pop();
      if (oldKey) {
        // Note: In production, you might want to use deleteS3Object here
        // await deleteS3Object(oldKey);
      }
    }

    const avatarUrl = getS3Url(imageKey);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        avatarUrl: true,
        birthday: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async generateAvatarUploadUrl(userId: string, contentType: string) {
    const key = `avatars/${userId}/${Date.now()}-avatar`;
    const uploadUrl = await generatePresignedUploadUrl(key, contentType);
    console.log('Generated upload URL:', uploadUrl);
    // save key to user's avatarKey field 
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: key },
    });
    return {
      uploadUrl,
      key,
    };
  }

  async getAvatarUrl(key: string): Promise<string> {
    // Generate a presigned URL that expires in 1 hour (3600 seconds)
    const url = await generatePresignedGetUrl(key, 3600);
    return url;
  }

  async getUserPosts(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: userId, deletedAt: null },
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({
        where: { authorId: userId, deletedAt: null },
      }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
