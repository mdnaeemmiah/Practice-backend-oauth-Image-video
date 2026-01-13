import { Router } from 'express';
import { doctorController } from './doctor.controller';
import { DoctorValidation } from './doctor.validation';
import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../../middlewares/globalErrorHandler';
import { USER_ROLE } from '../user/user.constant';
import { upload, uploadVideo } from '../../../utils/sendImageToCloudinary';
import { NextFunction, Request, Response } from 'express';

const doctorRouter = Router();

// Public route for location-based search
doctorRouter.get('/search-by-location', doctorController.searchByLocation);

doctorRouter.get('/', doctorController.getAllDoctors);

doctorRouter.get(
  '/specialization/:specialization',
  doctorController.getDoctorsBySpecialization
);

// Doctor's own profile management routes (MUST be before /:id routes)
doctorRouter.patch(
  '/my-profile',
  auth(USER_ROLE.doctor),
  validateRequest(DoctorValidation.updateDoctorValidationSchema),
  doctorController.updateMyProfile
);

doctorRouter.post(
  '/my-intro-video',
  auth(USER_ROLE.doctor),
  uploadVideo.single('video'),
  doctorController.uploadMyIntroVideo
);

doctorRouter.put(
  '/my-availability',
  auth(USER_ROLE.doctor),
  doctorController.updateMyAvailability
);

// Admin routes for creating/updating doctors
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
  '/change-status/:id',
  auth(USER_ROLE.admin),
  validateRequest(DoctorValidation.changeStatusValidationSchema),
  doctorController.changeStatus
);

// Generic routes with :id parameter (MUST be at the end)
doctorRouter.get('/:id', doctorController.getSingleDoctor);

doctorRouter.patch(
  '/:doctorId/availability-slot/:slotId',
  auth(USER_ROLE.admin),
  doctorController.updateAvailabilitySlotStatus
);

doctorRouter.patch(
  '/:doctorId/profile-update/approve',
  auth(USER_ROLE.admin),
  doctorController.approveProfileUpdate
);

doctorRouter.patch(
  '/:doctorId/profile-update/reject',
  auth(USER_ROLE.admin),
  doctorController.rejectProfileUpdate
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

export default doctorRouter;
