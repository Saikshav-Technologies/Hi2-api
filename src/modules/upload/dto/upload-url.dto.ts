import { IsString } from 'class-validator';

export class UploadUrlDto {
  @IsString()
  contentType: string;
}
