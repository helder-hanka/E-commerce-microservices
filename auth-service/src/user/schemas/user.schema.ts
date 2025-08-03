import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsInt, Min, Max } from 'class-validator';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SELL = 'SELL',
}

export type UserDocument = User & Document;

@Schema()
export class User {
  _id: Types.ObjectId;
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  @IsInt()
  @Min(0)
  @Max(100)
  age: number;

  @Prop()
  address: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  PostalCode: string;

  @Prop()
  city: string;

  @Prop()
  country: string;

  @Prop({ type: [String], enum: UserRole, default: [UserRole.USER] })
  roles: UserRole[];

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: String, unique: true, sparse: true })
  verificationToken: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
export const UserSchema = SchemaFactory.createForClass(User);
