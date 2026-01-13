import express from 'express';
import { patientController } from './patient.controller';
import auth from '../../../middlewares/globalErrorHandler';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

// Patient profile routes
router.post(
  '/profile',
  auth(USER_ROLE.user),
  patientController.createPatientProfile
);

router.get(
  '/profile',
  auth(USER_ROLE.user),
  patientController.getPatientProfile
);

router.patch(
  '/preferences',
  auth(USER_ROLE.user),
  patientController.updatePatientPreferences
);

// Matching routes
router.get(
  '/matches',
  auth(USER_ROLE.user),
  patientController.findDoctorMatches
);

// Favorites routes
router.post(
  '/favorites/:doctorId',
  auth(USER_ROLE.user),
  patientController.addToFavorites
);

router.delete(
  '/favorites/:doctorId',
  auth(USER_ROLE.user),
  patientController.removeFromFavorites
);

export default router;