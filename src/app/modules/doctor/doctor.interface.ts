import { Model } from 'mongoose';

export interface IDoctorAvailability {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  timeSlots: {
    startTime: string; // e.g., "09:00"
    endTime: string;   // e.g., "17:00"
  }[];
  isAvailable: boolean;
  specificDates?: {
    date: Date; // Specific date (YYYY-MM-DD)
    timeSlots: {
      startTime: string;
      endTime: string;
    }[];
    isAvailable: boolean;
  }[];
}

export interface IChamberLocation {
  address: string;
  city: string;
  zipCode: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  googleMapsUrl?: string;
}

export interface IDoctor {
  name: string;
  email: string;
  password: string;
  role: 'doctor';
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  chamberLocation?: IChamberLocation; // New field for geospatial location
  specialization?: string;
  experience?: number;
  qualification?: string;
  profileImg?: string;
  introVideo?: string; // Cloudinary URL for 1-minute intro video
  bio?: string;
  languages: string[];
  insuranceAccepted: string[];
  vibeTags: string[]; // e.g., ['warm', 'lgbtq-affirming', 'bilingual']
  communicationStyle: 'warm-empathetic' | 'direct-efficient' | 'collaborative';
  availability: IDoctorAvailability[];
  availabilitySlots?: Array<{
    id?: string;
    date?: string;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    status?: 'pending' | 'approved' | 'rejected';
    adminNotes?: string;
  }>;
  profileUpdateRequest?: {
    status: 'none' | 'pending' | 'approved' | 'rejected';
    requestedData?: any;
    requestedAt?: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    adminNotes?: string;
  };
  rating?: number;
  reviewCount?: number;
  consultationFee?: number;
  acceptsNewPatients: boolean;
  telehealth: boolean;
  inPerson: boolean;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  status: 'active' | 'in-progress' | 'blocked';
  isBlocked: boolean;
  isVerified: boolean;
  verificationCode?: string;
  isDeleted?: boolean;
}

export interface DoctorModel extends Model<IDoctor> {
  isDoctorExistsByEmail(email: string): Promise<IDoctor>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
}
