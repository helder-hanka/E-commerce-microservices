import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true; // Si aucune exigence de rôle, l'accès est autorisé
    }

    const { user } = context.switchToHttp().getRequest();
    // Vérifie si l'utilisateur a au moins un des rôles requis
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
