import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User } from '@prisma/client';
import { config } from '../../config/env';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private parseDurationToMs(value: string, fallbackMs: number): number {
    if (!value) {
      return fallbackMs;
    }

    const match = value.trim().match(/^(\d+)([smhd])$/i);
    if (!match) {
      return fallbackMs;
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        return fallbackMs;
    }
  }

  private getCookieOptions(maxAgeMs: number) {
    const isProduction = config.env === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: maxAgeMs,
      path: '/',
    } as const;
  }

  private setAuthCookies(res: Response, accessToken?: string, refreshToken?: string) {
    const accessMaxAge = this.parseDurationToMs(config.jwt.accessExpiresIn, 15 * 60 * 1000);
    const refreshMaxAge = this.parseDurationToMs(
      config.jwt.refreshExpiresIn,
      7 * 24 * 60 * 60 * 1000
    );

    if (accessToken) {
      res.cookie('accessToken', accessToken, this.getCookieOptions(accessMaxAge));
    }

    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, this.getCookieOptions(refreshMaxAge));
    }
  }

  private clearAuthCookies(res: Response) {
    const accessMaxAge = this.parseDurationToMs(config.jwt.accessExpiresIn, 15 * 60 * 1000);
    const refreshMaxAge = this.parseDurationToMs(
      config.jwt.refreshExpiresIn,
      7 * 24 * 60 * 60 * 1000
    );

    res.clearCookie('accessToken', this.getCookieOptions(accessMaxAge));
    res.clearCookie('refreshToken', this.getCookieOptions(refreshMaxAge));
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
      registerDto.gender,
      registerDto.country,
      registerDto.contact
    );

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return {
      success: true,
      data: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto.email, loginDto.password);

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return {
      success: true,
      data: result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);

    this.setAuthCookies(
      res,
      result.accessToken
      // result.refreshToken ?? refreshTokenDto.refreshToken
    );

    return {
      success: true,
      data: result,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() logoutDto: LogoutDto, @Res({ passthrough: true }) res: Response) {
    if (logoutDto.refreshToken) {
      await this.authService.logout(logoutDto.refreshToken);
    }

    this.clearAuthCookies(res);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: User) {
    await this.authService.logoutAll(user.id);
    return {
      success: true,
      message: 'Logged out from all devices',
    };
  }

  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    const result = await this.authService.requestPasswordReset(dto.email);
    return {
      success: true,
      data: result,
    };
  }

  @Post('password-reset/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(dto.email, dto.otp);
    return {
      success: true,
      data: result,
    };
  }

  @Post('password-reset/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
    return {
      success: true,
      data: result,
    };
  }
}
