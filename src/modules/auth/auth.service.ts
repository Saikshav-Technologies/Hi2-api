import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { hashPassword, comparePassword } from '../../utils/password';
import { JwtService } from '@nestjs/jwt';
import { config } from '../../config/env';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService
  ) {}

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    gender: string,
    country: string,
    contact: string
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        gender,
        country,
        contact,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        createdAt: true,
      },
    });

    const accessToken = this.generateAccessToken(user as any);
    const refreshToken = this.generateRefreshToken(user as any);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    const refreshTokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const accessToken = this.generateAccessToken(refreshTokenRecord.user);

    return {
      accessToken,
    };
  }

  async logout(token: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private generateAccessToken(user: User): string {
    return this.jwtService.sign(
      {
        userId: user.id,
        email: user.email,
      },
      {
        secret: config.jwt.accessSecret,
        expiresIn: config.jwt.accessExpiresIn,
      }
    );
  }

  private generateRefreshToken(user: User): string {
    return this.jwtService.sign(
      {
        userId: user.id,
        email: user.email,
      },
      {
        secret: config.jwt.refreshSecret,
        expiresIn: config.jwt.refreshExpiresIn,
      }
    );
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 10 minutes expiration
    const redis = this.redisService.getClient();
    const otpKey = `password_reset_otp:${email}`;
    await redis.setex(otpKey, 600, otp); // 600 seconds = 10 minutes

    // Store attempt count to prevent brute force
    const attemptKey = `password_reset_attempts:${email}`;
    await redis.incr(attemptKey);
    await redis.expire(attemptKey, 3600); // Reset attempts after 1 hour

    // TODO: Send OTP via email service
    // For now, return OTP in development mode (remove in production)
    if (config.env === 'development') {
      return {
        message: 'OTP sent successfully',
        otp, // Only in development
        expiresIn: '10 minutes',
      };
    }

    return {
      message: 'OTP sent to your email address',
      expiresIn: '10 minutes',
    };
  }

  async verifyOtp(email: string, otp: string) {
    const redis = this.redisService.getClient();

    // Check attempt count
    const attemptKey = `password_reset_attempts:${email}`;
    const attempts = await redis.get(attemptKey);

    if (attempts && parseInt(attempts) > 5) {
      throw new BadRequestException('Too many attempts. Please request a new OTP after 1 hour');
    }

    const otpKey = `password_reset_otp:${email}`;
    const storedOtp = await redis.get(otpKey);

    if (!storedOtp) {
      throw new BadRequestException('OTP has expired or does not exist. Please request a new OTP');
    }

    if (storedOtp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // OTP is valid - it will remain active until used in resetPassword or expires
    return {
      message: 'OTP verified successfully. You can now reset your password.',
    };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const redis = this.redisService.getClient();

    // Verify OTP one more time
    const otpKey = `password_reset_otp:${email}`;
    const storedOtp = await redis.get(otpKey);

    if (!storedOtp) {
      throw new BadRequestException('OTP has expired or does not exist. Please request a new OTP');
    }

    if (storedOtp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Clear OTP and reset token
    await redis.del(otpKey);
    await redis.del(`password_reset_token:${email}`);
    await redis.del(`password_reset_attempts:${email}`);

    // Logout from all devices for security
    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    return {
      message: 'Password reset successfully. Please login with your new password',
    };
  }
}
