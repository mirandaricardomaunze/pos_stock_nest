import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma:PrismaService ) {}
    async createUser(data: Prisma.UserCreateInput) {
        return this.prisma.user.create({
            data
        }); 
    }
    async getUsers(){
        return this.prisma.user.findMany()
        
    }
}
