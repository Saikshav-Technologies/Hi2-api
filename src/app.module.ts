import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { LikesModule } from './modules/likes/likes.module';
import { FollowsModule } from './modules/follows/follows.module';
import { FeedModule } from './modules/feed/feed.module';
import { EventsModule } from './modules/events/events.module';
import { RsvpsModule } from './modules/rsvps/rsvps.module';
import { UploadModule } from './modules/upload/upload.module';
import { AppController } from './app.controller';
import { config } from './config/env';

// Determine environment file based on NODE_ENV
const getEnvFilePath = () => {
  const env = process.env.NODE_ENV || 'development';
  return `.env.${env}`;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [getEnvFilePath(), '.env'], // Fallback to .env if specific env file doesn't exist
    }),
    JwtModule.register({
      global: true,
      secret: config.jwt.accessSecret,
      signOptions: { expiresIn: config.jwt.accessExpiresIn },
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    LikesModule,
    FollowsModule,
    FeedModule,
    EventsModule,
    RsvpsModule,
    UploadModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
