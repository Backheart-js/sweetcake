import { IsEmail, IsNotEmpty, IsString, Length, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 24)
  password: string;

  @IsIn(['admin', 'staff', 'customer'])
  @IsNotEmpty()
  role: string;
}
