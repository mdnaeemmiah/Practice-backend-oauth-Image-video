import { Patient } from './patient.model';
import { IPatient, IPatientPreferences } from './patient.interface';
import { matchingService } from '../matching/matching.service';
import AppError from '../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

const createPatientProfile = async (userId: string, preferences: IPatientPreferences) => {
  const existingPatient = await Patient.findOne({ userId });
  
  if (existingPatient) {
    // Update existing profile instead of throwing error
    const updatedPatient = await Patient.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          preferences: preferences,
          onboardingCompleted: true 
        }
      },
      { new: true, runValidators: true }
    );
    return updatedPatient;
  }

  const patient = await Patient.create({
    userId,
    preferences,
    onboardingCompleted: true,
  });

  return patient;
};

const updatePatientPreferences = async (userId: string, preferences: Partial<IPatientPreferences>) => {
  const patient = await Patient.findOneAndUpdate(
    { userId },
    { 
      $set: { 
        preferences: preferences,
        onboardingCompleted: true 
      }
    },
    { new: true, runValidators: true }
  );

  if (!patient) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Patient profile not found');
  }

  return patient;
};

const getPatientProfile = async (userId: string) => {
  const patient = await Patient.findOne({ userId });
  
  if (!patient) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Patient profile not found');
  }

  return patient;
};

const findDoctorMatches = async (userId: string, userLocation?: { latitude: number; longitude: number }) => {
  const patient = await Patient.findOne({ userId });
  
  if (!patient || !patient.onboardingCompleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Please complete onboarding first');
  }

  const matches = await matchingService.findMatches({
    patientId: userId,
    preferences: patient.preferences,
    userLocation,
  });

  // Update match history
  await Patient.findOneAndUpdate(
    { userId },
    { 
      $addToSet: { 
        matchHistory: { 
          $each: matches.map(match => match.doctorId) 
        }
      }
    }
  );

  return matches;
};

const addToFavorites = async (userId: string, doctorId: string) => {
  const patient = await Patient.findOneAndUpdate(
    { userId },
    { $addToSet: { favoritesDoctors: doctorId } },
    { new: true }
  );

  if (!patient) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Patient profile not found');
  }

  return patient;
};

const removeFromFavorites = async (userId: string, doctorId: string) => {
  const patient = await Patient.findOneAndUpdate(
    { userId },
    { $pull: { favoritesDoctors: doctorId } },
    { new: true }
  );

  if (!patient) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Patient profile not found');
  }

  return patient;
};

export const patientService = {
  createPatientProfile,
  updatePatientPreferences,
  getPatientProfile,
  findDoctorMatches,
  addToFavorites,
  removeFromFavorites,
};