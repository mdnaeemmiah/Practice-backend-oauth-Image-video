import { Document, Model } from 'mongoose';

export interface IMessage extends Document {
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageModel = Model<IMessage>;
