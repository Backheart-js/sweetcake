import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String })
  refreshToken?: string;

  @Prop({
    type: String,
    enum: ['admin', 'staff', 'customer'],
    default: 'customer',
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
