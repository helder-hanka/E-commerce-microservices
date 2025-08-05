import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  Param,
  ValidationPipe,
  BadRequestException,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UpdateRolesDto } from 'src/user/dto/update-roles.dto';
import { CreateUserDto } from 'src/user/dto/createUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ValidationPipe({ transform: true }))
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto);
  }

  //   @UseGuards(AuthGuard('jwt')) // Protège l'accès, nécessite un JWT valide
  //   @Get('profile')
  //   getProfile(@Req() req) {
  //     return this.authService.getProfile(req.user.userId);
  //   }

  //   @UseGuards(AuthGuard('jwt'))
  //   @Post('profile')
  //   updateProfile(@Req() req, @Body() updateProfileDto: any) {
  //     return this.authService.updateProfile(req.user.userId, updateProfileDto);
  //   }

  //   // Exemple d'un endpoint pour admin_application
  //   @UseGuards(AuthGuard('jwt'), RolesGuard) // D'abord auth, puis rôles
  //   @Roles('admin_application')
  //   @Post('users/:id/roles')
  //   async updateRoles(
  //     @Param('id') userId: string,
  //     @Body(new ValidationPipe()) updateRolesDto: UpdateRolesDto,
  //   ) {
  //     return this.authService.updateRoles(userId, updateRolesDto.roles);
  //   }
}
