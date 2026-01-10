import { Router } from 'express';
import authRouter from '../app/modules/auth/auth.route';
import oauthRouter from '../app/modules/auth/oauth.route';
import userRouter from '../app/modules/user/user.route';
import taskRoute from '../app/modules/task/task.route';
import adminRouter from '../app/modules/admin/admin.route';
import doctorRouter from '../app/modules/doctor/doctor.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/oauth',
    route: oauthRouter,
  },
  {
    path: '/user',
    route: userRouter,
  },
  {
    path: '/task',
    route: taskRoute,
  },
  {
    path: '/admin',
    route: adminRouter,
  },
  {
    path: '/doctor',
    route: doctorRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
