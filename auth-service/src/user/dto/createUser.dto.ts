import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  verificationToken: string;
  isEmailVerified: boolean;

  @IsEnum(UserRole, {
    message:
      'Invalid role. Role must be one of the following: USER, ADMIN, SELL',
  })
  @IsNotEmpty()
  roles: UserRole;
}
