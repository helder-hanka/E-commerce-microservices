import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

// Mettez cette interface dans un fichier séparé si vous la réutilisez (ex: jwt-payload.interface.ts)
export interface JwtPayload {
  sub: string; // Le 'subject' du token, généralement l'identifiant de l'utilisateur
  email: string;
  roles: string[];
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<{ userId: string; email: string; roles: string[] }> {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles, // Ajout des rôles de l'utilisateur
    };
  }
}
