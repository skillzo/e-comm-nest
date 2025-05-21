import { IsEmail, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

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

  @IsNotEmpty({ message: 'Password is required', each: true })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
