import { Router } from 'express';
import { messageController } from './message.controller';
import auth from '../../../middlewares/globalErrorHandler';
import { USER_ROLE } from '../user/user.constant';

const messageRouter = Router();

messageRouter.post('/', messageController.sendMessage);

messageRouter.get(
  '/my-messages',
  auth(USER_ROLE.doctor),
  messageController.getDoctorMessages
);

messageRouter.patch(
  '/:id/read',
  auth(USER_ROLE.doctor),
  messageController.markAsRead
);

export default messageRouter;
