import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/AppError';
import { IUserRole } from '../app/modules/user/user.interface';
import config from '../app/config';
import { User } from '../app/modules/user/user.model';
import { Admin } from '../app/modules/admin/admin.model';
import { Doctor } from '../app/modules/doctor/doctor.model';

const auth = (...requiredRoles: IUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    // checking if the token is missing
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    // checking if the given token is valid
    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as string
    ) as JwtPayload;

    const { role, email, iat } = decoded;

    // checking if the user is exist in appropriate collection based on role
    let user: any;

    if (role === 'admin') {
      user = await Admin.findOne({ email });
    } else if (role === 'doctor') {
      user = await Doctor.findOne({ email });
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
    }

    if (user.status === 'blocked') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked !');
    }

    // Allow admins to proceed even if status is 'in-progress'
    if (user.status === 'in-progress' && user.role !== 'admin') {
      throw new AppError(httpStatus.FORBIDDEN, 'Please verify your email!');
    }

    // Authorize using the resolved user's role from DB
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    req.user = user;
    next();
  });
};

export default auth;
