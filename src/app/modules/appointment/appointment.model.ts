import { Schema, model } from 'mongoose';
import { IAppointment, AppointmentModel } from './appointment.interface';

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: String,
      required: true,
      ref: 'User',
    },
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: true,
    },
    patientPhone: {
      type: String,
    },
    doctorId: {
      type: String,
      required: true,
      ref: 'Doctor',
    },
    doctorName: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    appointmentType: {
      type: String,
      enum: ['in-person', 'virtual'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Appointment = model<IAppointment, AppointmentModel>('Appointment', AppointmentSchema);
