import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const roles = createUserDto.roles ? createUserDto.roles : [UserRole.USER]; // Rôle par défaut
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      roles: [roles], // Rôle par défaut
    });
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async updateVerificationToken(userId: string, token: string): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { verificationToken: token })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return updatedUser;
  }

  async markEmailAsVerified(userId: string): Promise<User> {
    const updateEmailAsVerified = await this.userModel
      .findByIdAndUpdate(
        userId,
        { isEmailVerified: true, $unset: { verificationToken: '' } },
        { new: true },
      )
      .exec();

    if (!updateEmailAsVerified) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return updateEmailAsVerified;
  }

  async findByVerifiedToken(token: string): Promise<UserDocument | null> {
    const user = await this.userModel
      .findOne({ verificationToken: token })
      .exec();
    if (!user) {
      throw new NotFoundException(
        'User with this verification token not found',
      );
    }
    return user;
  }

  async updateRoles(
    userId: string,
    newRoles: UserRole[],
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { roles: newRoles }, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    return updatedUser;
  }
}
