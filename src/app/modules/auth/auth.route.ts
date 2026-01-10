import { Router, NextFunction, Request, Response } from 'express';
import { UserValidation } from '../user/user.validation';
import { AuthValidation } from './auth.validation';
import validateRequest from '../../../middlewares/validateRequest';
import { AuthControllers } from './auth.controller';
import { upload } from '../../../utils/sendImageToCloudinary';

const authRouter = Router();

authRouter.post(
  '/register',
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(UserValidation.UserValidationSchema),
  AuthControllers.register
);
authRouter.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.login
);
authRouter.post(
  '/verify-email',
  validateRequest(AuthValidation.verifyEmailValidationSchema),
  AuthControllers.verifyEmail
);
authRouter.post(
  '/change-password',
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword
);

authRouter.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthControllers.refreshToken
);

authRouter.post(
  '/forget-password',
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword
);

authRouter.post(
  '/code-verify',
  validateRequest(AuthValidation.verifyEmailValidationSchema),
  AuthControllers.verifyCode
);

authRouter.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthControllers.resetPassword
);

export default authRouter;
