// Optionnel, si vous avez besoin de typer l'utilisateur
export interface UserJwtPayload {
  userId: string;
  email: string;
}

// Créez une interface pour la requête étendue
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: UserJwtPayload; // Ou simplement { userId: string } si c'est la seule propriété
}
