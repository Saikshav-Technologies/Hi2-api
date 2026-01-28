import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
    type: String,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    type: String,
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    type: String,
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User gender',
    example: 'Male',
    enum: ['Male', 'Female', 'Other'],
    type: String,
  })
  @IsString()
  gender: string;

  @ApiProperty({
    description: 'User country',
    example: 'India',
    type: String,
  })
  @IsString()
  country: string;

  @ApiProperty({
    description: 'User contact number',
    example: '+91 9876543210',
    type: String,
  })
  @IsString()
  contact: string;
}
