import { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../app/modules/user/user.interface';
import { IDoctor } from '../app/modules/doctor/doctor.interface';
import { IAdmin } from '../app/modules/admin/admin.interface';

declare global {
  namespace Express {
    interface Request {
      user: IUser | IDoctor | IAdmin;
      socketAuthToken: string;
    }
  }
}
