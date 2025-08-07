// src/modules/auth/dto/update-password.dto.ts
import { IsString, MinLength, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(6, { message: 'A nova senha deve ter pelo menos 6 caracteres' })
  @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, {
    message:
      'A nova senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
  })
  newPassword: string;

  @IsString()
  confirmPassword: string;
}
