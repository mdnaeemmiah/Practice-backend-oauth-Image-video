import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { doctorService } from './doctor.service';

const getAllDoctors = catchAsync(async (req, res) => {
  const result = await doctorService.getAllDoctors();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Doctors retrieved successfully',
    data: result,
  });
});

const getSingleDoctor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await doctorService.getSingleDoctor(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Doctor retrieved successfully',
    data: result,
  });
});

const createDoctor = catchAsync(async (req, res) => {
  const result = await doctorService.createDoctor(req.file, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Doctor created successfully',
    data: result,
  });
});

const updateDoctor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await doctorService.updateDoctor(id, req.file, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Doctor updated successfully',
    data: result,
  });
});

const deleteDoctor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await doctorService.deleteDoctor(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Doctor deleted successfully',
    data: result,
  });
});

const changeStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await doctorService.changeStatus(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Doctor status updated successfully',
    data: result,
  });
});

const getDoctorsBySpecialization = catchAsync(async (req, res) => {
  const { specialization } = req.params;
  const result = await doctorService.getDoctorsBySpecialization(specialization);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Doctors by specialization retrieved successfully',
    data: result,
  });
});

export const doctorController = {
  getAllDoctors,
  getSingleDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  changeStatus,
  getDoctorsBySpecialization,
};
