import { Document, Model } from 'mongoose';

export interface IPatientPreferences {
  careType: 'primary-care' | 'ob-gyn' | 'mental-health' | 'dermatology' | 'cardiology' | 'other';
  careMode: 'in-person' | 'virtual' | 'both';
  location: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
    address?: string; // Optional human-readable address
  };
  communicationStyle: 'warm-empathetic' | 'direct-efficient' | 'collaborative' | 'no-preference';
  availabilityPreferences: {
    weekendAvailability: boolean;
    eveningAppointments: boolean;
    urgentCare: boolean;
  };
  languagePreferences: string[];
  insuranceProvider?: string;
  vibePreferences: string[]; // e.g., ['lgbtq-affirming', 'bilingual', 'family-friendly']
}

export interface IPatient extends Document {
  userId: string; // Reference to User model
  preferences: IPatientPreferences;
  onboardingCompleted: boolean;
  matchHistory: string[]; // Array of doctor IDs
  favoritesDoctors: string[]; // Array of doctor IDs
  createdAt: Date;
  updatedAt: Date;
}

export type PatientModel = Model<IPatient>;