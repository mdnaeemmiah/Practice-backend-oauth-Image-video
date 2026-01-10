import { IAdmin } from './admin.interface';
import { Admin } from './admin.model';
import { sendImageToCloudinary } from '../../../utils/sendImageToCloudinary';

const getAllAdmins = async () => {
  const result = await Admin.find();
  return result;
};

const getSingleAdmin = async (id: string) => {
  const result = await Admin.findById(id);
  return result;
};

const createAdmin = async (file: any, data: IAdmin) => {
  if (file) {
    const imageName = `${data.email}-${Date.now()}`;
    const path = file?.path;
    const uploadResult: any = await sendImageToCloudinary(imageName, path);
    data.profileImg = uploadResult?.secure_url;
  }

  const result = await Admin.create(data);
  return result;
};

const updateAdmin = async (id: string, file: any, data: Partial<IAdmin>) => {
  if (file) {
    const imageName = `${data.email || id}-${Date.now()}`;
    const path = file?.path;
    const uploadResult: any = await sendImageToCloudinary(imageName, path);
    data.profileImg = uploadResult?.secure_url;
  }

  const result = await Admin.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteAdmin = async (id: string) => {
  const result = await Admin.findByIdAndDelete(id);
  return result;
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await Admin.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

export const adminService = {
  getAllAdmins,
  getSingleAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  changeStatus,
};
