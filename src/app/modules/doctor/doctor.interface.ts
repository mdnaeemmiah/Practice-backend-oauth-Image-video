import { Model } from 'mongoose';

export interface IDoctor {
  name: string;
  email: string;
  password: string;
  role: 'doctor';
  phone?: string;
  address?: string;
  city?: string;
  specialization?: string;
  experience?: number;
  qualification?: string;
  profileImg?: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  status: 'active' | 'in-progress' | 'blocked';
  isBlocked: boolean;
  isVerified: boolean;
  verificationCode?: string;
  isDeleted?: boolean;
}

export interface DoctorModel extends Model<IDoctor> {
  isDoctorExistsByEmail(email: string): Promise<IDoctor>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
}
