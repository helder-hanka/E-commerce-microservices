import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Body,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Param } from '@nestjs/common';
import { UpdateRolesDto } from './dto/update-roles.dto';
import { CreateProfileDto } from './dto/createProfile.dto';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface.';

@Controller('profile')
export class UserController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('jwt')) // Protège l'accès, nécessite un JWT valide
  @Get()
  async getProfile(@Req() req: RequestWithUser) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUpdateProfile(
    @Req() req: RequestWithUser,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.authService.createUpdateProfile(
      req.user.userId,
      createProfileDto,
    );
  }

  // Exemple d'un endpoint pour admin_application
  @UseGuards(AuthGuard('jwt'), RolesGuard) // D'abord auth, puis rôles
  @Roles('admin_application')
  @Post('users/:id/roles')
  async updateRoles(
    @Param('id') userId: string,
    @Body(new ValidationPipe()) updateRolesDto: UpdateRolesDto,
  ) {
    return this.authService.updateRoles(userId, updateRolesDto.roles);
  }
}
