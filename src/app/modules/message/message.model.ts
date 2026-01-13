import { Schema, model } from 'mongoose';
import { IMessage, MessageModel } from './message.interface';

const MessageSchema = new Schema<IMessage>(
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
    doctorId: {
      type: String,
      required: true,
      ref: 'Doctor',
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Message = model<IMessage, MessageModel>('Message', MessageSchema);
