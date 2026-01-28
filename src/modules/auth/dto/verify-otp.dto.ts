import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email address associated with the OTP',
    example: 'user@example.com',
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '6-digit OTP sent to email',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp: string;
}
