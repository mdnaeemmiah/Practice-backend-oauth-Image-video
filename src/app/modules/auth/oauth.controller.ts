import { Request, Response } from 'express';
import config from '../../config';
import { generateTokens, findOrCreateUser } from '../../config/oauth-utils';
import http_status from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';

// Google OAuth Callback
export const googleCallback = catchAsync(
  async (req: Request, res: Response) => {
    const user = await findOrCreateUser(req.user as any, 'google');
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    res.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    });

    // Redirect to frontend with tokens
    res.redirect(
      `${config.frontend.url}/auth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);


// Apple OAuth Callback
export const appleCallback = catchAsync(async (req: Request, res: Response) => {
  const user = await findOrCreateUser(req.user as any, 'apple');
  const { accessToken, refreshToken } = generateTokens(user._id.toString());

  res.cookie('refreshToken', refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
  });

  // Redirect to frontend with tokens
  res.redirect(
    `${config.frontend.url}/auth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`
  );
});

// Get Current User
export const getCurrentUser = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    sendResponse(res, {
      statusCode: http_status.OK,
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  }
);

// Logout
export const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');

  sendResponse(res, {
    statusCode: http_status.OK,
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
});
