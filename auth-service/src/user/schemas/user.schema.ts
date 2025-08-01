import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
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

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

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
