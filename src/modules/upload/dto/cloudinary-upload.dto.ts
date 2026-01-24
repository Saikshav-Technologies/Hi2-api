import { IsString, IsOptional } from 'class-validator';

export class CloudinaryUploadDto {
  @IsOptional()
  @IsString()
  resourceType?: 'image' | 'video' | 'raw';
}
