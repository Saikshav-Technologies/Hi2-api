import { IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  caption: string;
}
