import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = () => ({
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    logoutAll: jest.fn(),
    requestPasswordReset: jest.fn(),
    verifyOtp: jest.fn(),
    resetPassword: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useFactory: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('returns success response on register', async () => {
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
      const dto: RegisterDto = {
        email: 'user@example.com',
        password: 'P@ssw0rd!',
        firstName: 'Jane',
        lastName: 'Doe',
        gender: 'female',
        country: 'US',
        contact: '+1234567890',
      };
      const user = {
        id: 'user-id',
        email: dto.email,
        password: 'hashed-password',
        firstName: dto.firstName,
        lastName: dto.lastName,
        username: 'jane.doe',
        bio: '',
        avatarUrl: '',
        gender: dto.gender,
        country: dto.country,
        contact: dto.contact,
        birthday: new Date('2000-01-01'),
        isPrivate: false,
        showStatus: true,
        allowMessageRequests: true,
        isVerified: false,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      const serviceResult = {
        user,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      authService.register.mockResolvedValue(serviceResult);

      await expect(controller.register(dto, res)).resolves.toEqual({
        success: true,
        data: serviceResult,
      });

      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(authService.register).toHaveBeenCalledWith(
        dto.email,
        dto.password,
        dto.firstName,
        dto.lastName,
        dto.gender,
        dto.country,
        dto.contact
      );
    });

    it('throws when AuthService.register fails', async () => {
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
      const dto: RegisterDto = {
        email: 'user@example.com',
        password: 'P@ssw0rd!',
        firstName: 'Jane',
        lastName: 'Doe',
        gender: 'female',
        country: 'US',
        contact: '+1234567890',
      };
      const error = new HttpException('Email exists', HttpStatus.CONFLICT);
      authService.register.mockRejectedValue(error);

      await expect(controller.register(dto, res)).rejects.toBe(error);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('returns success response on login', async () => {
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
      const dto: LoginDto = { email: 'user@example.com', password: 'P@ssw0rd!' };
      const user = {
        id: 'user-id',
        email: dto.email,
        password: 'hashed-password',
        firstName: 'Jane',
        lastName: 'Doe',
        username: 'jane.doe',
        bio: '',
        avatarUrl: '',
        gender: '',
        country: '',
        contact: '',
        birthday: new Date('2000-01-01'),
        isPrivate: false,
        showStatus: true,
        allowMessageRequests: true,
        isVerified: true,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      const serviceResult = { user, accessToken: 'access', refreshToken: 'refresh' };
      authService.login.mockResolvedValue(serviceResult);

      await expect(controller.login(dto, res)).resolves.toEqual({
        success: true,
        data: serviceResult,
      });

      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
    });

    it('throws when AuthService.login fails', async () => {
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
      const dto: LoginDto = { email: 'user@example.com', password: 'bad' };
      const error = new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      authService.login.mockRejectedValue(error);

      await expect(controller.login(dto, res)).rejects.toBe(error);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshToken', () => {
    it('returns success response on refresh', async () => {
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
      const dto: RefreshTokenDto = { refreshToken: 'refresh-token' };
      const serviceResult = { accessToken: 'new-access', refreshToken: 'new-refresh' };
      authService.refreshToken.mockResolvedValue(serviceResult);

      await expect(controller.refreshToken(dto, res)).resolves.toEqual({
        success: true,
        data: serviceResult,
      });

      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
      expect(authService.refreshToken).toHaveBeenCalledWith(dto.refreshToken);
    });

    it('throws when AuthService.refreshToken fails', async () => {
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
      const dto: RefreshTokenDto = { refreshToken: 'invalid' };
      const error = new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
      authService.refreshToken.mockRejectedValue(error);

      await expect(controller.refreshToken(dto, res)).rejects.toBe(error);
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('calls AuthService.logout when refreshToken is provided', async () => {
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
      const dto: LogoutDto = { refreshToken: 'refresh-token' };
      authService.logout.mockResolvedValue(undefined);

      await expect(controller.logout(dto, res)).resolves.toEqual({
        success: true,
        message: 'Logged out successfully',
      });

      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(authService.logout).toHaveBeenCalledWith(dto.refreshToken);
    });

    it('does not call AuthService.logout when refreshToken is missing', async () => {
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
      const dto: LogoutDto = { refreshToken: undefined };

      await expect(controller.logout(dto, res)).resolves.toEqual({
        success: true,
        message: 'Logged out successfully',
      });

      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('throws when AuthService.logout fails', async () => {
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
      const dto: LogoutDto = { refreshToken: 'refresh-token' };
      const error = new HttpException('Logout failed', HttpStatus.BAD_REQUEST);
      authService.logout.mockRejectedValue(error);

      await expect(controller.logout(dto, res)).rejects.toBe(error);
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('logoutAll', () => {
    it('returns success response on logoutAll', async () => {
      const user = { id: 'user-id' } as User;
      authService.logoutAll.mockResolvedValue(undefined);

      await expect(controller.logoutAll(user)).resolves.toEqual({
        success: true,
        message: 'Logged out from all devices',
      });

      expect(authService.logoutAll).toHaveBeenCalledTimes(1);
      expect(authService.logoutAll).toHaveBeenCalledWith(user.id);
    });

    it('throws when AuthService.logoutAll fails', async () => {
      const user = { id: 'user-id' } as User;
      const error = new HttpException('Failed', HttpStatus.INTERNAL_SERVER_ERROR);
      authService.logoutAll.mockRejectedValue(error);

      await expect(controller.logoutAll(user)).rejects.toBe(error);
      expect(authService.logoutAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('requestPasswordReset', () => {
    it('returns success response on request', async () => {
      const dto: RequestPasswordResetDto = { email: 'user@example.com' };
      const serviceResult = {
        message: 'OTP sent',
        otp: '123456',
        expiresIn: '10m',
      };
      authService.requestPasswordReset.mockResolvedValue(serviceResult);

      await expect(controller.requestPasswordReset(dto)).resolves.toEqual({
        success: true,
        data: serviceResult,
      });

      expect(authService.requestPasswordReset).toHaveBeenCalledTimes(1);
      expect(authService.requestPasswordReset).toHaveBeenCalledWith(dto.email);
    });

    it('throws when AuthService.requestPasswordReset fails', async () => {
      const dto: RequestPasswordResetDto = { email: 'user@example.com' };
      const error = new HttpException('Not found', HttpStatus.NOT_FOUND);
      authService.requestPasswordReset.mockRejectedValue(error);

      await expect(controller.requestPasswordReset(dto)).rejects.toBe(error);
      expect(authService.requestPasswordReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyOtp', () => {
    it('returns success response on verify', async () => {
      const dto: VerifyOtpDto = { email: 'user@example.com', otp: '123456' };
      const serviceResult = {
        message: 'OTP verified successfully. You can now reset your password.',
      };
      authService.verifyOtp.mockResolvedValue(serviceResult);

      await expect(controller.verifyOtp(dto)).resolves.toEqual({
        success: true,
        data: serviceResult,
      });

      expect(authService.verifyOtp).toHaveBeenCalledTimes(1);
      expect(authService.verifyOtp).toHaveBeenCalledWith(dto.email, dto.otp);
    });

    it('throws when AuthService.verifyOtp fails', async () => {
      const dto: VerifyOtpDto = { email: 'user@example.com', otp: '000000' };
      const error = new HttpException('Invalid OTP', HttpStatus.UNAUTHORIZED);
      authService.verifyOtp.mockRejectedValue(error);

      await expect(controller.verifyOtp(dto)).rejects.toBe(error);
      expect(authService.verifyOtp).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetPassword', () => {
    it('returns success response on reset', async () => {
      const dto: ResetPasswordDto = {
        email: 'user@example.com',
        otp: '123456',
        newPassword: 'NewP@ssw0rd!',
      };
      const serviceResult = {
        message: 'Password reset successfully. Please login with your new password',
      };
      authService.resetPassword.mockResolvedValue(serviceResult);

      await expect(controller.resetPassword(dto)).resolves.toEqual({
        success: true,
        data: serviceResult,
      });

      expect(authService.resetPassword).toHaveBeenCalledTimes(1);
      expect(authService.resetPassword).toHaveBeenCalledWith(dto.email, dto.otp, dto.newPassword);
    });

    it('throws when AuthService.resetPassword fails', async () => {
      const dto: ResetPasswordDto = {
        email: 'user@example.com',
        otp: 'bad',
        newPassword: 'NewP@ssw0rd!',
      };
      const error = new HttpException('Invalid OTP', HttpStatus.UNAUTHORIZED);
      authService.resetPassword.mockRejectedValue(error);

      await expect(controller.resetPassword(dto)).rejects.toBe(error);
      expect(authService.resetPassword).toHaveBeenCalledTimes(1);
    });
  });
});
