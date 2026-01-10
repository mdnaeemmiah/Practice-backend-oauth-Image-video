import { IDoctor } from './doctor.interface';
import { Doctor } from './doctor.model';
import { sendImageToCloudinary } from '../../../utils/sendImageToCloudinary';

const getAllDoctors = async () => {
  const result = await Doctor.find();
  return result;
};

const getSingleDoctor = async (id: string) => {
  const result = await Doctor.findById(id);
  return result;
};

const createDoctor = async (file: any, data: IDoctor) => {
  if (file) {
    const imageName = `${data.email}-${Date.now()}`;
    const path = file?.path;
    const uploadResult: any = await sendImageToCloudinary(imageName, path);
    data.profileImg = uploadResult?.secure_url;
  }

  const result = await Doctor.create(data);
  return result;
};

const updateDoctor = async (id: string, file: any, data: Partial<IDoctor>) => {
  if (file) {
    const imageName = `${data.email || id}-${Date.now()}`;
    const path = file?.path;
    const uploadResult: any = await sendImageToCloudinary(imageName, path);
    data.profileImg = uploadResult?.secure_url;
  }

  const result = await Doctor.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteDoctor = async (id: string) => {
  const result = await Doctor.findByIdAndDelete(id);
  return result;
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await Doctor.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const getDoctorsBySpecialization = async (specialization: string) => {
  const result = await Doctor.find({ specialization });
  return result;
};

export const doctorService = {
  getAllDoctors,
  getSingleDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  changeStatus,
  getDoctorsBySpecialization,
};
