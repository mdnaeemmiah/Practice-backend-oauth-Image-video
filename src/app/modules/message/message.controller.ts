import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { messageService } from './message.service';

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await messageService.sendMessage(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Message sent successfully',
    data: result,
  });
});

const getDoctorMessages = catchAsync(async (req: Request, res: Response) => {
  const { email } = (req as any).user;
  
  // Get doctor by email to find doctorId
  const Doctor = require('../doctor/doctor.model').Doctor;
  const doctor = await Doctor.findOne({ email });
  
  const result = await messageService.getDoctorMessages(doctor._id.toString());

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Messages retrieved successfully',
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await messageService.markAsRead(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message marked as read',
    data: result,
  });
});

export const messageController = {
  sendMessage,
  getDoctorMessages,
  markAsRead,
};
