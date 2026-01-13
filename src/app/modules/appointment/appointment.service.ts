import { Appointment } from './appointment.model';
import { IAppointment } from './appointment.interface';

const createAppointment = async (data: Partial<IAppointment>) => {
  const appointment = await Appointment.create(data);
  return appointment;
};

const getAllAppointments = async () => {
  const appointments = await Appointment.find()
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name specialization')
    .sort({ createdAt: -1 });
  return appointments;
};

const getPendingAppointments = async () => {
  const appointments = await Appointment.find({ status: 'pending' })
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name specialization')
    .sort({ appointmentDate: 1 });
  return appointments;
};

const updateAppointmentStatus = async (
  appointmentId: string,
  status: string,
  adminNotes?: string
) => {
  const appointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    { status, adminNotes },
    { new: true }
  );
  return appointment;
};

const getDoctorAppointments = async (doctorId: string) => {
  console.log('Fetching appointments for doctorId:', doctorId);

  // Find appointments using doctor's _id directly
  const appointments = await Appointment.find({ 
    doctorId: doctorId,
    status: { $in: ['approved', 'completed'] }
  })
  .populate('patientId', 'name email phone')
  .sort({ appointmentDate: 1 });
  
  console.log('Found appointments:', appointments.length);
  
  return appointments;
};

const getPatientAppointments = async (patientId: string) => {
  console.log('Fetching appointments for patientId:', patientId);
  
  const appointments = await Appointment.find({ patientId })
    .populate('doctorId', 'name specialization')
    .sort({ appointmentDate: -1 });
  
  console.log('Found patient appointments:', appointments.length);
  
  return appointments;
};

export const appointmentService = {
  createAppointment,
  getAllAppointments,
  getPendingAppointments,
  updateAppointmentStatus,
  getDoctorAppointments,
  getPatientAppointments,
};
