import mongoose, { Schema, model } from 'mongoose';
import { IPatient, PatientModel } from './patient.interface';

const PatientPreferencesSchema = new Schema({
  careType: {
    type: String,
    enum: ['primary-care', 'ob-gyn', 'mental-health', 'dermatology', 'cardiology', 'other'],
    required: true,
  },
  careMode: {
    type: String,
    enum: ['in-person', 'virtual', 'both'],
    required: true,
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    radius: { type: Number, default: 25 }, // in kilometers
    address: { type: String }, // Optional human-readable address
  },
  communicationStyle: {
    type: String,
    enum: ['warm-empathetic', 'direct-efficient', 'collaborative', 'no-preference'],
    required: true,
  },
  availabilityPreferences: {
    weekendAvailability: { type: Boolean, default: false },
    eveningAppointments: { type: Boolean, default: false },
    urgentCare: { type: Boolean, default: false },
  },
  languagePreferences: [{ type: String }],
  insuranceProvider: { type: String },
  vibePreferences: [{ type: String }],
});

const PatientSchema = new Schema<IPatient>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      ref: 'User',
    },
    preferences: {
      type: PatientPreferencesSchema,
      required: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    matchHistory: [{
      type: String,
      ref: 'Doctor',
    }],
    favoritesDoctors: [{
      type: String,
      ref: 'Doctor',
    }],
  },
  {
    timestamps: true,
  }
);

export const Patient = model<IPatient, PatientModel>('Patient', PatientSchema);