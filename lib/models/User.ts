import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  email: string;
  name?: string;
  image?: string;
  provider: 'google' | 'github';
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    image: { type: String },
    provider: { type: String, enum: ['google', 'github'], required: true },
    providerId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const UserModel: Model<IUser> =
  mongoose.models?.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
