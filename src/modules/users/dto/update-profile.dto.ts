import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @Transform(({ value }) => (value === '' || value === null ? null : value))
  @IsOptional()
  birthday?: string | null;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
