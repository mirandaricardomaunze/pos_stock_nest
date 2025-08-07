import 
{
     IsEmail,
     IsString,
     IsStrongPassword, 
     IsNotEmpty,
     IsOptional,
     Length
} from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
    password: string;
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Length(2, 50)
    firstName?: string;
    
    @IsOptional()
    @IsString()
    role: string= "user";
}