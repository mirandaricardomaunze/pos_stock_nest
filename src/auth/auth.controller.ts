import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { diskStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { extname } from 'path';

// Swagger decorators
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AssignCompanyDto } from './dto/assign-company.dto';

@ApiTags('Auth') // Agrupa as rotas no Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  async register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login de usuário' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  async login(@Body() data: LoginDto) {
    const user = await this.authService.validateUser(data.email, data.password);
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Put('update-profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar nome e email do perfil' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
    },
  }})
  async updateProfile(@Req() req, @Body() dto: { name: string; email: string }) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @Post('upload-avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new Error('Tipo inválido. Apenas imagens JPG, JPEG, PNG e GIF são permitidas.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Fazer upload do avatar' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.authService.updateAvatar(req.user.id, file.filename);
  }

  @Put('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alterar senha' })
  async changePassword(@Req() req, @Body() dto: UpdatePasswordDto) {
    return this.authService.changePassword(req.user.id, dto);
  }


  @UseGuards(AuthGuard('jwt'))
  @Patch('assign-company')
  async assignCompany(@Req() req, @Body() dto: AssignCompanyDto) {
    const userId = req.user.id; 
    const companyId = dto.companyId;
    if (!companyId) {
      throw new BadRequestException('companyId é obrigatório');
    }

    const updatedUser = await this.authService.assignCompanyToUser(userId, companyId);
    return {
      message: 'Empresa associada ao usuário com sucesso',
      user: updatedUser,
    };
  }
}
