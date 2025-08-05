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
import { User, UserDocument, UserRole } from 'src/user/schemas/user.schema';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { CreateProfileDto } from 'src/user/dto/createProfile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}
  async signUp(createUserDto: CreateUserDto): Promise<{ message: string }> {
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

  async login(
    loginDto: any,
  ): Promise<{ accessToken: string; userId: string; roles: UserRole[] }> {
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
      userId: user._id.toString(),
      roles: user.roles,
    };
  }

  async getProfile(userId: string): Promise<object> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, verificationToken, ...result } = user.toObject(); // Exclut les champs sensibles
    return result;
  }

  async createUpdateProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
  ): Promise<UserDocument> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const createdUser = await this.userService.update(userId, createProfileDto);
    if (!createdUser) {
      throw new NotFoundException('Failed to create profile');
    }
    // Caster l'objet en 'any' pour accéder à la méthode toObject()
    const userObject = (createdUser as any).toObject();
    const { password, verificationToken, ...result } = userObject; // Exclut les champs sensibles
    return result;
  }

  async updateRoles(
    userId: string,
    newRoles: UserRole[],
  ): Promise<UserDocument> {
    return this.userService.updateRoles(userId, newRoles);
  }
}
