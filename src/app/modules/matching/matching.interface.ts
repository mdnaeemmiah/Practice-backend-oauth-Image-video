import { Document, Model } from 'mongoose';
import { IPatientPreferences } from '../patient/patient.interface';

export interface IMatchCriteria {
  patientId: string;
  preferences: IPatientPreferences;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface IMatchResult {
  doctorId: string;
  matchScore: number;
  matchReasons: string[];
  distance?: number; // in miles
}

export interface IMatchHistory extends Document {
  patientId: string;
  matchResults: IMatchResult[];
  selectedDoctorId?: string;
  createdAt: Date;
}

export type MatchHistoryModel = Model<IMatchHistory>;