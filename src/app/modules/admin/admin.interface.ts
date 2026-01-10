import { Model } from 'mongoose';

export interface IAdmin {
  name: string;
  email: string;
  password: string;
  role: 'admin';
  phone?: string;
  address?: string;
  city?: string;
  profileImg?: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  status: 'active' | 'in-progress' | 'blocked';
  isBlocked: boolean;
  isVerified: boolean;
  verificationCode?: string;
  isDeleted?: boolean;
}

export interface AdminModel extends Model<IAdmin> {
  isAdminExistsByEmail(email: string): Promise<IAdmin>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
}
