import {
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  Req,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Param } from '@nestjs/common';
import { UpdateRolesDto } from './dto/update-roles.dto';

@Controller('profile')
export class UserController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('jwt')) // Protège l'accès, nécessite un JWT valide
  @Get('profile')
  getProfile(@Req() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  updateProfile(@Req() req, @Body() updateProfileDto: any) {
    return this.authService.updateProfile(req.user.userId, updateProfileDto);
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
