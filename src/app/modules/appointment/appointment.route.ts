import { Router } from 'express';
import { appointmentController } from './appointment.controller';
import auth from '../../../middlewares/globalErrorHandler';
import { USER_ROLE } from '../user/user.constant';

const appointmentRouter = Router();

appointmentRouter.post('/', appointmentController.createAppointment);

appointmentRouter.get(
  '/',
  auth(USER_ROLE.admin),
  appointmentController.getAllAppointments
);

appointmentRouter.get(
  '/pending',
  auth(USER_ROLE.admin),
  appointmentController.getPendingAppointments
);

appointmentRouter.patch(
  '/:id/status',
  auth(USER_ROLE.admin),
  appointmentController.updateAppointmentStatus
);

appointmentRouter.get(
  '/my-appointments',
  auth(USER_ROLE.user),
  appointmentController.getPatientAppointments
);

appointmentRouter.get(
  '/doctor-appointments',
  auth(USER_ROLE.doctor),
  appointmentController.getDoctorAppointments
);

export default appointmentRouter;
