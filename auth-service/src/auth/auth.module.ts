import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from '../shared/mail.service';

@Module({
  imports: [
    forwardRef(() => UserModule), // ← ici pour éviter la boucle
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  //   providers: [AuthService, JwtStrategy, MailService,JwtModule],
  providers: [AuthService, JwtStrategy, MailService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

// @Module({
//   imports: [
//     UserModule, // Permet à AuthService d'accéder à UserService
//     PassportModule.register({ defaultStrategy: 'jwt' }),
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       useFactory: async (configService: ConfigService) => ({
//         secret: configService.get<string>('JWT_SECRET'),
//         signOptions: {
//           expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
//         },
//       }),
//       inject: [ConfigService],
//     }),
//     ConfigModule, // Assurez-vous que ConfigModule est importé ici aussi
//   ],
//   providers: [AuthService, JwtStrategy, MailService], // Ajoutez MailService
//   controllers: [AuthController],
//   exports: [AuthService, JwtModule],
// })
// export class AuthModule {}
