import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AvatarUploadDto } from './dto/avatar-upload.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  type GetProfileResult = Awaited<ReturnType<UsersService['getProfile']>>;
  type UpdateProfileResult = Awaited<ReturnType<UsersService['updateProfile']>>;
  type UpdateAvatarResult = Awaited<ReturnType<UsersService['updateAvatar']>>;
  type GetUserPostsResult = Awaited<ReturnType<UsersService['getUserPosts']>>;

  const mockUsersService = () => ({
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    generateAvatarUploadUrl: jest.fn(),
    updateAvatar: jest.fn(),
    getAvatarUrl: jest.fn(),
    getUserPosts: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useFactory: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(OptionalAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('returns profile when current user is provided', async () => {
      const userId = 'user-id';
      const currentUser = { id: 'current-user-id' } as User;
      const profile = { id: userId, username: 'john' } as GetProfileResult;
      usersService.getProfile.mockResolvedValue(profile);

      await expect(controller.getProfile(userId, currentUser)).resolves.toEqual({
        success: true,
        data: profile,
      });

      expect(usersService.getProfile).toHaveBeenCalledTimes(1);
      expect(usersService.getProfile).toHaveBeenCalledWith(userId, currentUser.id);
    });

    it('returns profile when current user is missing', async () => {
      const userId = 'user-id';
      const profile = { id: userId, username: 'john' } as GetProfileResult;
      usersService.getProfile.mockResolvedValue(profile);

      await expect(controller.getProfile(userId, undefined)).resolves.toEqual({
        success: true,
        data: profile,
      });

      expect(usersService.getProfile).toHaveBeenCalledTimes(1);
      expect(usersService.getProfile).toHaveBeenCalledWith(userId, undefined);
    });

    it('throws when UsersService.getProfile fails', async () => {
      const userId = 'user-id';
      const error = new HttpException('Not found', HttpStatus.NOT_FOUND);
      usersService.getProfile.mockRejectedValue(error);

      await expect(controller.getProfile(userId, undefined)).rejects.toBe(error);
      expect(usersService.getProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateProfile', () => {
    it('updates profile with parsed birthday when valid', async () => {
      const user = { id: 'user-id' } as User;
      const dto: UpdateProfileDto = {
        firstName: 'Jane',
        birthday: '2000-01-01',
      } as UpdateProfileDto;
      const profile = { id: user.id, firstName: 'Jane' } as UpdateProfileResult;
      usersService.updateProfile.mockResolvedValue(profile);

      await expect(controller.updateProfile(user, dto)).resolves.toEqual({
        success: true,
        data: profile,
      });

      expect(usersService.updateProfile).toHaveBeenCalledTimes(1);
      const callArgs = usersService.updateProfile.mock.calls[0];
      expect(callArgs[0]).toBe(user.id);
      expect(callArgs[1]).toMatchObject({ firstName: 'Jane' });
      expect(callArgs[1].birthday instanceof Date).toBe(true);
    });

    it('updates profile with null birthday when explicitly null', async () => {
      const user = { id: 'user-id' } as User;
      const dto: UpdateProfileDto = { birthday: null } as UpdateProfileDto;
      const profile = { id: user.id } as UpdateProfileResult;
      usersService.updateProfile.mockResolvedValue(profile);

      await expect(controller.updateProfile(user, dto)).resolves.toEqual({
        success: true,
        data: profile,
      });

      expect(usersService.updateProfile).toHaveBeenCalledTimes(1);
      expect(usersService.updateProfile).toHaveBeenCalledWith(user.id, {
        ...dto,
        birthday: null,
      });
    });

    it('updates profile with null birthday when invalid date string', async () => {
      const user = { id: 'user-id' } as User;
      const dto: UpdateProfileDto = { birthday: 'not-a-date' } as UpdateProfileDto;
      const profile = { id: user.id } as UpdateProfileResult;
      usersService.updateProfile.mockResolvedValue(profile);

      await expect(controller.updateProfile(user, dto)).resolves.toEqual({
        success: true,
        data: profile,
      });

      expect(usersService.updateProfile).toHaveBeenCalledTimes(1);
      expect(usersService.updateProfile).toHaveBeenCalledWith(user.id, {
        ...dto,
        birthday: null,
      });
    });

    it('updates profile with undefined birthday when not provided', async () => {
      const user = { id: 'user-id' } as User;
      const dto: UpdateProfileDto = { firstName: 'Jane' } as UpdateProfileDto;
      const profile = { id: user.id } as UpdateProfileResult;
      usersService.updateProfile.mockResolvedValue(profile);

      await expect(controller.updateProfile(user, dto)).resolves.toEqual({
        success: true,
        data: profile,
      });

      expect(usersService.updateProfile).toHaveBeenCalledTimes(1);
      expect(usersService.updateProfile).toHaveBeenCalledWith(user.id, {
        ...dto,
        birthday: undefined,
      });
    });

    it('throws when UsersService.updateProfile fails', async () => {
      const user = { id: 'user-id' } as User;
      const dto: UpdateProfileDto = { firstName: 'Jane' } as UpdateProfileDto;
      const error = new HttpException('Failed', HttpStatus.BAD_REQUEST);
      usersService.updateProfile.mockRejectedValue(error);

      await expect(controller.updateProfile(user, dto)).rejects.toBe(error);
      expect(usersService.updateProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateAvatarUploadUrl', () => {
    it('returns upload url result', async () => {
      const user = { id: 'user-id' } as User;
      const dto: AvatarUploadDto = { contentType: 'image/png' } as AvatarUploadDto;
      const result = { uploadUrl: 'https://upload', key: 'avatars/1.png' };
      usersService.generateAvatarUploadUrl.mockResolvedValue(result);

      await expect(controller.generateAvatarUploadUrl(user, dto)).resolves.toEqual({
        success: true,
        data: result,
      });

      expect(usersService.generateAvatarUploadUrl).toHaveBeenCalledTimes(1);
      expect(usersService.generateAvatarUploadUrl).toHaveBeenCalledWith(user.id, dto.contentType);
    });

    it('throws when UsersService.generateAvatarUploadUrl fails', async () => {
      const user = { id: 'user-id' } as User;
      const dto: AvatarUploadDto = { contentType: 'image/png' } as AvatarUploadDto;
      const error = new HttpException('Failed', HttpStatus.INTERNAL_SERVER_ERROR);
      usersService.generateAvatarUploadUrl.mockRejectedValue(error);

      await expect(controller.generateAvatarUploadUrl(user, dto)).rejects.toBe(error);
      expect(usersService.generateAvatarUploadUrl).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateAvatar', () => {
    it('returns updated profile', async () => {
      const user = { id: 'user-id' } as User;
      const dto: UpdateAvatarDto = { key: 'avatars/1.png' } as UpdateAvatarDto;
      const profile = { id: user.id, avatarUrl: 'https://cdn/avatar.png' } as UpdateAvatarResult;
      usersService.updateAvatar.mockResolvedValue(profile);

      await expect(controller.updateAvatar(user, dto)).resolves.toEqual({
        success: true,
        data: profile,
      });

      expect(usersService.updateAvatar).toHaveBeenCalledTimes(1);
      expect(usersService.updateAvatar).toHaveBeenCalledWith(user.id, dto.key);
    });

    it('throws when UsersService.updateAvatar fails', async () => {
      const user = { id: 'user-id' } as User;
      const dto: UpdateAvatarDto = { key: 'avatars/1.png' } as UpdateAvatarDto;
      const error = new HttpException('Failed', HttpStatus.BAD_REQUEST);
      usersService.updateAvatar.mockRejectedValue(error);

      await expect(controller.updateAvatar(user, dto)).rejects.toBe(error);
      expect(usersService.updateAvatar).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAvatarUrl', () => {
    it('throws BadRequest when key is missing', async () => {
      await expect(controller.getAvatarUrl('')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns avatar url when key is provided', async () => {
      const key = 'avatars/1.png';
      const url = 'https://cdn/avatar.png';
      usersService.getAvatarUrl.mockResolvedValue(url);

      await expect(controller.getAvatarUrl(key)).resolves.toEqual({
        success: true,
        data: { url },
      });

      expect(usersService.getAvatarUrl).toHaveBeenCalledTimes(1);
      expect(usersService.getAvatarUrl).toHaveBeenCalledWith(key);
    });

    it('throws when UsersService.getAvatarUrl fails', async () => {
      const key = 'avatars/1.png';
      const error = new HttpException('Failed', HttpStatus.INTERNAL_SERVER_ERROR);
      usersService.getAvatarUrl.mockRejectedValue(error);

      await expect(controller.getAvatarUrl(key)).rejects.toBe(error);
      expect(usersService.getAvatarUrl).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserPosts', () => {
    it('returns user posts with defaults', async () => {
      const userId = 'user-id';
      const result = { items: [], page: 1, limit: 10, total: 0 } as unknown as GetUserPostsResult;
      usersService.getUserPosts.mockResolvedValue(result);

      await expect(controller.getUserPosts(userId)).resolves.toEqual({
        success: true,
        data: result,
      });

      expect(usersService.getUserPosts).toHaveBeenCalledTimes(1);
      expect(usersService.getUserPosts).toHaveBeenCalledWith(userId, 1, 10);
    });

    it('returns user posts with provided page and limit', async () => {
      const userId = 'user-id';
      const result = { items: ['a'], page: 2, limit: 5, total: 1 } as unknown as GetUserPostsResult;
      usersService.getUserPosts.mockResolvedValue(result);

      await expect(controller.getUserPosts(userId, 2, 5)).resolves.toEqual({
        success: true,
        data: result,
      });

      expect(usersService.getUserPosts).toHaveBeenCalledTimes(1);
      expect(usersService.getUserPosts).toHaveBeenCalledWith(userId, 2, 5);
    });

    it('throws when UsersService.getUserPosts fails', async () => {
      const userId = 'user-id';
      const error = new HttpException('Failed', HttpStatus.INTERNAL_SERVER_ERROR);
      usersService.getUserPosts.mockRejectedValue(error);

      await expect(controller.getUserPosts(userId)).rejects.toBe(error);
      expect(usersService.getUserPosts).toHaveBeenCalledTimes(1);
    });
  });
});
