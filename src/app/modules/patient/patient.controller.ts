import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { patientService } from './patient.service';

const createPatientProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?._id;
  const preferences = req.body;

  const result = await patientService.createPatientProfile(userId, preferences);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Patient profile created successfully',
    data: result,
  });
});

const updatePatientPreferences = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?._id;
  const preferences = req.body;

  const result = await patientService.updatePatientPreferences(userId, preferences);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Patient preferences updated successfully',
    data: result,
  });
});

const getPatientProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?._id;

  const result = await patientService.getPatientProfile(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Patient profile retrieved successfully',
    data: result,
  });
});

const findDoctorMatches = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?._id;
  const { latitude, longitude } = req.query;

  const userLocation = latitude && longitude 
    ? { latitude: parseFloat(latitude as string), longitude: parseFloat(longitude as string) }
    : undefined;

  const result = await patientService.findDoctorMatches(userId, userLocation);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Doctor matches found successfully',
    data: result,
  });
});

const addToFavorites = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?._id;
  const { doctorId } = req.params;

  const result = await patientService.addToFavorites(userId, doctorId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Doctor added to favorites',
    data: result,
  });
});

const removeFromFavorites = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?._id;
  const { doctorId } = req.params;

  const result = await patientService.removeFromFavorites(userId, doctorId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Doctor removed from favorites',
    data: result,
  });
});

export const patientController = {
  createPatientProfile,
  updatePatientPreferences,
  getPatientProfile,
  findDoctorMatches,
  addToFavorites,
  removeFromFavorites,
};