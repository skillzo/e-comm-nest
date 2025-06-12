import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'The user name' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The user email',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail(
    {
      domain_specific_validation: true,
      host_whitelist: ['gmail.com', 'yahoo.com', 'yopmail.com'],
    },
    { message: 'Email must be a valid email' },
  )
  email: string;

  @ApiProperty({ example: 'password123', description: 'The user password' })
  // @IsNotEmpty({ message: 'Password is required', each: true })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;
}

namespace CreateUserDto {
  export interface Request {
    name: string;
    email: string;
    password: string;
  }
}
