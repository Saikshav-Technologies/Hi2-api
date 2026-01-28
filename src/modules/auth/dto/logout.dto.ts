import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    description: 'Refresh token to invalidate (optional)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
