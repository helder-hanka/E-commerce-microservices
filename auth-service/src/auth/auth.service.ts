import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../shared/mail.service';
import { ConfigService } from '@nestjs/config';
import { UserDocument, UserRole } from 'src/user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}
  async signUp(createUserDto: any): Promise<{ message: string }> {
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User already exists with this email');
    }

    const verificationToken = uuidv4();
    const createdUser = await this.userService.create({
      ...createUserDto,
      verificationToken,
      isEmailVerified: false, // Par défaut, l'email n'est pas vérifié
    });

    // Envoi de l'email de vérification
    const verificationUrl = `${this.configService.get<string>('APP_URL')}/auth/verify-email?token=${verificationToken}`;
    await this.mailService.sendMail(
      createdUser.email,
      'Email Verification',
      `Please verify your email by clicking on the following link: ${verificationUrl}`,
      `<p>Please verify your email by clicking on the following link: <a href="${verificationUrl}">Verify Email</a></p>`,
    );

    return {
      message:
        'User created successfully. Please check your email to verify your account.',
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userService.findByVerifiedToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    if (user.isEmailVerified) {
      return { message: 'Email already verified.' };
    }

    await this.userService.markEmailAsVerified(user._id.toString());
    return { message: 'Email verified successfully! You can now log in.' };
  }

  async login(loginDto: any): Promise<{ accessToken: string }> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email address first.',
      );
    }

    const payload = { email: user.email, sub: user._id, roles: user.roles };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, verificationToken, ...result } = user.toObject(); // Exclut les champs sensibles
    return result;
  }

  async updateProfile(userId: string, updateProfileDto: any) {
    return this.userService.update;
  }

  async updateRoles(
    userId: string,
    newRoles: UserRole[],
  ): Promise<UserDocument> {
    return this.userService.updateRoles(userId, newRoles);
  }
}
