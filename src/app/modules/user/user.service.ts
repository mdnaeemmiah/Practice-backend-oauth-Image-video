import { sendImageToCloudinary } from '../../../utils/sendImageToCloudinary';
import { IUser } from './user.interface';
import { User } from './user.model';
import { Admin } from '../admin/admin.model';
import { Doctor } from '../doctor/doctor.model';

const getUser = async () => {
  const result = await User.find();
  return result;
};

const getSingleUser = async (id: string) => {
  //   const result = await User.findOne({name:"habi jabi"})
  const result = await User.findById(id);
  return result;
};

const updateUser = async (id: string, file: any, data: IUser) => {
  if (file) {
    const imageName = `${data.email || id}-${Date.now()}`;
    const path = file?.path;
    const uploadResult: any = await sendImageToCloudinary(imageName, path);
    (data as any).profileImg = uploadResult?.secure_url;
  }

  const result = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteUser = async (id: string) => {
  const result = await User.findByIdAndDelete(id);
  return result;
};

const getMe = async (email: string) => {
  const result = await User.findOne({ email });

  return result;
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const createDoctorIntoDB = async (
  file: any,
  password: string,
  payload: any
) => {
  const doctorData: any = {};

  doctorData.password = password;
  doctorData.role = 'doctor';
  doctorData.email = payload.email;
  doctorData.name = payload.name;
  doctorData.phone = payload.phone;
  doctorData.address = payload.address;
  doctorData.city = payload.city;
  doctorData.specialization = payload.specialization;
  doctorData.experience = payload.experience;
  doctorData.qualification = payload.qualification;

  if (file) {
    const imageName = `${doctorData.email}-${Date.now()}`;
    const path = file?.path;
    const uploadResult: any = await sendImageToCloudinary(imageName, path);
    doctorData.profileImg = uploadResult?.secure_url;
  }

  const newDoctor = await Doctor.create(doctorData);
  return newDoctor;
};

const createAdminIntoDB = async (file: any, password: string, payload: any) => {
  const adminData: any = {};

  adminData.password = password;
  adminData.role = 'admin';
  adminData.email = payload.email;
  adminData.name = payload.name;
  adminData.phone = payload.phone;
  adminData.address = payload.address;
  adminData.city = payload.city;

  if (file) {
    const imageName = `${adminData.email}-${Date.now()}`;
    const path = file?.path;
    const uploadResult: any = await sendImageToCloudinary(imageName, path);
    adminData.profileImg = uploadResult?.secure_url;
  }

  const newAdmin = await Admin.create(adminData);
  return newAdmin;
};

export const userService = {
  getUser,
  getSingleUser,
  updateUser,
  deleteUser,
  changeStatus,
  getMe,
  createAdminIntoDB,
  createDoctorIntoDB,
};
