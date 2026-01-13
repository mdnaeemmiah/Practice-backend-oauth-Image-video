import { Document, Model } from 'mongoose';

export interface IAppointment extends Document {
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: 'in-person' | 'virtual';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentModel = Model<IAppointment>;
