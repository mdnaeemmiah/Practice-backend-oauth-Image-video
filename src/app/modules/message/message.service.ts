import { Message } from './message.model';
import { IMessage } from './message.interface';

const sendMessage = async (data: Partial<IMessage>) => {
  const message = await Message.create(data);
  return message;
};

const getDoctorMessages = async (doctorId: string) => {
  const messages = await Message.find({ doctorId }).sort({ createdAt: -1 });
  return messages;
};

const markAsRead = async (messageId: string) => {
  const message = await Message.findByIdAndUpdate(
    messageId,
    { isRead: true },
    { new: true }
  );
  return message;
};

const getUnreadCount = async (doctorId: string) => {
  const count = await Message.countDocuments({ doctorId, isRead: false });
  return count;
};

export const messageService = {
  sendMessage,
  getDoctorMessages,
  markAsRead,
  getUnreadCount,
};
