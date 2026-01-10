import { Router, Request, Response, NextFunction } from 'express';
import { userController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../../middlewares/globalErrorHandler';
import { USER_ROLE } from './user.constant';
import { upload } from '../../../utils/sendImageToCloudinary';
import { AdminValidation } from '../admin/admin.validation';
import { DoctorValidation } from '../doctor/doctor.validation';

const userRouter = Router();

userRouter.get(
  '/me',
  auth(USER_ROLE.user, USER_ROLE.doctor, USER_ROLE.admin),
  userController.getMe
);

userRouter.get('/:userId', userController.getSingleUser);
userRouter.patch(
  '/:id',
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  userController.updateUser
);
userRouter.delete('/:id', userController.deleteUser);
userRouter.get('/', userController.getUser);
userRouter.patch(
  '/change-status/:id',
  // auth( USER_ROLE.admin),
  validateRequest(UserValidation.changeStatusValidationSchema),
  userController.changeStatus
);

userRouter.post(
  '/create-doctor',
  auth(USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(DoctorValidation.createDoctorValidationSchema),
  userController.createDoctor
);

userRouter.post(
  '/create-admin',
  auth(USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(AdminValidation.createAdminValidationSchema),
  userController.createAdmin
);

export default userRouter;
