import { IsString } from 'class-validator';

export class AvatarUploadDto {
  @IsString()
  contentType: string;
}
