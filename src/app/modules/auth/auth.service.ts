import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import { TLoginUser } from './auth.interface';
import { StatusCodes } from 'http-status-codes';
import {
  createToken,
  generateVerificationCode,
  verifyToken,
} from './auth.utils';
import AppError from '../../../errors/AppError';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import { Admin } from '../admin/admin.model';
import { Doctor } from '../doctor/doctor.model';
import { sendEmail } from '../../../utils/sendEmail';
import { sendImageToCloudinary } from '../../../utils/sendImageToCloudinary';

const register = async (file: any, payload: IUser) => {
  const verificationCode = generateVerificationCode();
  const userData = {
    ...payload,
    verificationCode,
    isVerified: false,
    status: 'in-progress',
  };

  let user: any;

  // If a file is provided, upload to Cloudinary and set profileImg
  if (file) {
    const imageName = `${payload.email}-${Date.now()}`;
    const path = file?.path;
    const uploadResult: any = await sendImageToCloudinary(imageName, path);
    (userData as any).profileImg = uploadResult?.secure_url;
  }

  // Create user in appropriate collection based on role
  if (payload.role === 'admin') {
    user = await Admin.create({
      ...userData,
      password: userData.password || '',
    });
  } else if (payload.role === 'doctor') {
    user = await Doctor.create({
      ...userData,
      password: userData.password || '',
    });
  } else {
    user = await User.create(userData);
  }

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Verify Your Email</h2>
      <p>Thank you for registering. Please use the following code to verify your account:</p>
      <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
        ${verificationCode}
      </div>
      <p>This code will expire soon.</p>
    </div>
  `;

  await sendEmail(user.email, emailHtml);

  return {
    email: user.email, // Return email
    name: user.name, // Return name
    id: user._id.toString(), // Return the user ID (converted to string if it's a MongoDB ObjectId)
    role: user.role,
  };
};

const verifyEmail = async (email: string, code: string) => {
  // Try to find user in all collections
  let user = await User.findOne({ email }).select(
    '+password +verificationCode'
  );
  let Model: any = User;

  if (!user) {
    user = await Admin.findOne({ email }).select('+password +verificationCode');
    Model = Admin;
  }

  if (!user) {
    user = await Doctor.findOne({ email }).select(
      '+password +verificationCode'
    );
    Model = Doctor;
  }

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Trim the codes for comparison to avoid whitespace issues
  const storedCode = user.verificationCode?.trim();
  const providedCode = code?.trim();

  if (!storedCode) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Verification code not found. Please request a new code.'
    );
  }

  if (storedCode !== providedCode) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Invalid verification code. Please check your email for the correct code.`
    );
  }

  await Model.findOneAndUpdate(
    { email },
    {
      isVerified: true,
      status: 'active',
      verificationCode: null,
    },
    { new: true }
  );

  return null;
};

const login = async (payload: TLoginUser) => {
  // Try to find user in all collections
  let user = await User.findOne({ email: payload.email }).select('+password');
  let Model: any = User;

  if (!user) {
    user = await Admin.findOne({ email: payload.email }).select('+password');
    Model = Admin;
  }

  if (!user) {
    user = await Doctor.findOne({ email: payload.email }).select('+password');
    Model = Doctor;
  }

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is blocked ! !');
  }

  // For non-admin users, enforce verification and status checks
  if (user.role !== 'admin') {
    if (userStatus === 'in-progress') {
      throw new AppError(StatusCodes.FORBIDDEN, 'Verify your email first');
    }

    // checking if the user is verified
    if (!user.isVerified) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Verify your email first');
    }
  }

  // checking if the password is correct
  const isPasswordMatched = await bcrypt.compare(
    payload?.password,
    user?.password || ''
  );

  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Password do not match');
  }

  // create token and sent to the  client
  const jwtPayload = {
    email: user.email,
    name: user.name,
    id: user._id.toString(),
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: user?.needsPasswordChange,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByCustomId(userData.email);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found !');
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is blocked ! !');
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password || '')))
    throw new AppError(StatusCodes.FORBIDDEN, 'Password do not matched');

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    {
      email: userData.email,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    }
  );

  return null;
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { email, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByCustomId(email);
  // console.log(decoded);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is blocked ! !');
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized !');
  }

  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken,
  };
};

const forgetPassword = async (userEmail: string) => {
  // Try to find user in all collections
  let user = await User.findOne({ email: userEmail });
  let Model: any = User;

  if (!user) {
    user = await Admin.findOne({ email: userEmail });
    Model = Admin;
  }

  if (!user) {
    user = await Doctor.findOne({ email: userEmail });
    Model = Doctor;
  }

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found !');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is blocked ! !');
  }

  const verificationCode = generateVerificationCode();

  await Model.findOneAndUpdate({ email: userEmail }, { verificationCode });

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Password Reset Code</h2>
      <p>You requested to reset your password. Please use the following code to verify your identity:</p>
      <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
        ${verificationCode}
      </div>
      <p>This code will expire soon.</p>
    </div>
  `;

  await sendEmail(user.email, emailHtml);
};

const verifyCode = async (email: string, code: string) => {
  // Try to find user in all collections
  let user = await User.findOne({ email }).select('+verificationCode');
  let Model: any = User;

  if (!user) {
    user = await Admin.findOne({ email }).select('+verificationCode');
    Model = Admin;
  }

  if (!user) {
    user = await Doctor.findOne({ email }).select('+verificationCode');
    Model = Doctor;
  }

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (user.verificationCode !== code) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid verification code');
  }

  // Don't clear the code here - it will be used in resetPassword

  const jwtPayload = {
    role: user.role,
    email: user.email,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m'
  );

  return { resetToken };
};

const resetPassword = async (payload: {
  email: string;
  code: string;
  newPassword: string;
}) => {
  const { email, code, newPassword } = payload;

  // Try to find user in all collections
  let user = await User.findOne({ email }).select('+verificationCode');
  let Model: any = User;

  if (!user) {
    user = await Admin.findOne({ email }).select('+verificationCode');
    Model = Admin;
  }

  if (!user) {
    user = await Doctor.findOne({ email }).select('+verificationCode');
    Model = Doctor;
  }

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is deleted!');
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is blocked!');
  }

  // check code
  if (user.verificationCode !== code) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid or expired code!');
  }

  // hash new password
  const newHashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await Model.findOneAndUpdate(
    { email: email },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
      verificationCode: null,
    }
  );

  return null;
};

export const AuthService = {
  register,
  verifyEmail,
  login,
  changePassword,
  refreshToken,
  forgetPassword,
  verifyCode,
  resetPassword,
};
