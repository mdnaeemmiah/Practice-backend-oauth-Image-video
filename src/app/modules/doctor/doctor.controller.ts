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

const updateMyProfile = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await doctorService.updateDoctorProfile(email, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const uploadMyIntroVideo = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await doctorService.uploadIntroVideo(email, req.file);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Intro video uploaded successfully',
    data: result,
  });
});

const updateMyAvailability = catchAsync(async (req, res) => {
  const { email } = req.user;
  const { availability, weeklyAvailability } = req.body;
  
  // Support both old availability format and new weeklyAvailability format
  const updateData = weeklyAvailability ? { weeklyAvailability } : { availability };
  const result = await doctorService.updateAvailability(email, updateData);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Availability updated successfully',
    data: result,
  });
});

const searchByLocation = catchAsync(async (req, res) => {
  const { latitude, longitude, radius, specialization, careMode, communicationStyle, languages, vibeTags } = req.query;

  if (!latitude || !longitude) {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: 'Latitude and longitude are required',
      data: null,
    });
  }

  const result = await doctorService.searchDoctorsByLocation(
    parseFloat(latitude as string),
    parseFloat(longitude as string),
    radius ? parseFloat(radius as string) : 25, // default 25km
    {
      specialization: specialization as string,
      careMode: careMode as any,
      communicationStyle: communicationStyle as string,
      languages: languages ? (languages as string).split(',') : undefined,
      vibeTags: vibeTags ? (vibeTags as string).split(',') : undefined,
    }
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Doctors retrieved successfully',
    data: result,
  });
});

const updateAvailabilitySlotStatus = catchAsync(async (req, res) => {
  const { doctorId, slotId } = req.params;
  const { status, adminNotes } = req.body;

  const result = await doctorService.updateAvailabilitySlotStatus(
    doctorId,
    slotId,
    status,
    adminNotes
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Availability slot status updated successfully',
    data: result,
  });
});

const approveProfileUpdate = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const { adminNotes } = req.body;
  const adminEmail = req.user.email;

  const result = await doctorService.approveProfileUpdate(
    doctorId,
    adminEmail,
    adminNotes
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile update approved successfully',
    data: result,
  });
});

const rejectProfileUpdate = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const { adminNotes } = req.body;
  const adminEmail = req.user.email;

  if (!adminNotes) {
    throw new Error('Admin notes are required for rejection');
  }

  const result = await doctorService.rejectProfileUpdate(
    doctorId,
    adminEmail,
    adminNotes
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile update rejected successfully',
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
  updateMyProfile,
  uploadMyIntroVideo,
  updateMyAvailability,
  searchByLocation,
  updateAvailabilitySlotStatus,
  approveProfileUpdate,
  rejectProfileUpdate,
};
