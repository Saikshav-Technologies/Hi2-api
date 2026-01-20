import { IsArray, IsOptional, IsString, ArrayMaxSize } from 'class-validator';

export class CreatePostDto {
  @IsString()
  caption: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  mediaUrls: string[];

  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
