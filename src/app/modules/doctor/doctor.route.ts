import { Router } from 'express';
import { doctorController } from './doctor.controller';
import { DoctorValidation } from './doctor.validation';
import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../../middlewares/globalErrorHandler';
import { USER_ROLE } from '../user/user.constant';
import { upload } from '../../../utils/sendImageToCloudinary';
import { NextFunction, Request, Response } from 'express';

const doctorRouter = Router();

doctorRouter.get('/', doctorController.getAllDoctors);

doctorRouter.get(
  '/specialization/:specialization',
  doctorController.getDoctorsBySpecialization
);

doctorRouter.get('/:id', doctorController.getSingleDoctor);

doctorRouter.post(
  '/create',
  auth(USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(DoctorValidation.createDoctorValidationSchema),
  doctorController.createDoctor
);

doctorRouter.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.doctor),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(DoctorValidation.updateDoctorValidationSchema),
  doctorController.updateDoctor
);

doctorRouter.delete(
  '/:id',
  auth(USER_ROLE.admin),
  doctorController.deleteDoctor
);

doctorRouter.patch(
  '/change-status/:id',
  auth(USER_ROLE.admin),
  validateRequest(DoctorValidation.changeStatusValidationSchema),
  doctorController.changeStatus
);

export default doctorRouter;
