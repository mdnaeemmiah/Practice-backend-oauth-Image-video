import { Router } from 'express';
import { adminController } from './admin.controller';
import { AdminValidation } from './admin.validation';
import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../../middlewares/globalErrorHandler';
import { USER_ROLE } from '../user/user.constant';
import { upload } from '../../../utils/sendImageToCloudinary';
import { NextFunction, Request, Response } from 'express';

const adminRouter = Router();

adminRouter.get('/',auth(USER_ROLE.admin),  adminController.getAllAdmins);

adminRouter.get('/:id', auth(USER_ROLE.admin), adminController.getSingleAdmin);

adminRouter.post(
  '/create',
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(AdminValidation.createAdminValidationSchema),
  adminController.createAdmin
);

adminRouter.patch(
  '/:id',
  auth(USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(AdminValidation.updateAdminValidationSchema),
  adminController.updateAdmin
);

adminRouter.delete('/:id', auth(USER_ROLE.admin), adminController.deleteAdmin);

adminRouter.patch(
  '/change-status/:id',
  auth(USER_ROLE.admin),
  validateRequest(AdminValidation.changeStatusValidationSchema),
  adminController.changeStatus
);

export default adminRouter;
