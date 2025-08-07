import { Controller, Post, Body, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './create.users..dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}
   
}

