import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { appointmentService } from './appointment.service';

const createAppointment = catchAsync(async (req: Request, res: Response) => {
  const result = await appointmentService.createAppointment(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Appointment request sent successfully',
    data: result,
  });
});

const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
  const result = await appointmentService.getAllAppointments();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Appointments retrieved successfully',
    data: result,
  });
});

const getPendingAppointments = catchAsync(async (req: Request, res: Response) => {
  const result = await appointmentService.getPendingAppointments();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Pending appointments retrieved successfully',
    data: result,
  });
});

const updateAppointmentStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  
  const result = await appointmentService.updateAppointmentStatus(id, status, adminNotes);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Appointment status updated successfully',
    data: result,
  });
});

const getPatientAppointments = catchAsync(async (req: Request, res: Response) => {
  // req.user contains the full User document from auth middleware
  const patientId = req.user._id.toString();
  const result = await appointmentService.getPatientAppointments(patientId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Your appointments retrieved successfully',
    data: result,
  });
});

const getDoctorAppointments = catchAsync(async (req: Request, res: Response) => {
  // req.user contains the full Doctor document from auth middleware
  const doctorId = req.user._id.toString();
  const result = await appointmentService.getDoctorAppointments(doctorId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Doctor appointments retrieved successfully',
    data: result,
  });
});

export const appointmentController = {
  createAppointment,
  getAllAppointments,
  getPendingAppointments,
  updateAppointmentStatus,
  getPatientAppointments,
  getDoctorAppointments,
};
