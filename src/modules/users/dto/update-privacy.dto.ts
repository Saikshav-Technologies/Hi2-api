import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePrivacyDto {
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsBoolean()
  @IsOptional()
  showStatus?: boolean;

  @IsBoolean()
  @IsOptional()
  allowMessageRequests?: boolean;
}
