import mongoose, { Schema, model } from 'mongoose';
import { IDoctor, DoctorModel } from './doctor.interface';
import config from '../../config';
import bcrypt from 'bcrypt';
import { DoctorStatus, Specializations } from './doctor.constant';

const DoctorSchema = new Schema<IDoctor, DoctorModel>(
  {
    name: {
      type: String,
      required: [true, 'Please provide doctor name'],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Please provide doctor email'],
      unique: true,
      validate: {
        validator: function (value: string) {
          return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value);
        },
        message: '{VALUE} is not a valid email',
      },
      immutable: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['doctor'],
      default: 'doctor',
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    chamberLocation: {
      address: { type: String },
      city: { type: String },
      zipCode: { type: String },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
      googleMapsUrl: { type: String },
    },
    specialization: {
      type: String,
      enum: Specializations,
      default: 'General Medicine',
    },
    experience: {
      type: Number,
      default: 0,
    },
    qualification: {
      type: String,
      default: '',
    },
    profileImg: { type: String, default: '' },
    introVideo: { type: String, default: '' },
    bio: { type: String, default: '' },
    languages: [{ type: String }],
    insuranceAccepted: [{ type: String }],
    vibeTags: [{ type: String }],
    communicationStyle: {
      type: String,
      enum: ['warm-empathetic', 'direct-efficient', 'collaborative'],
      default: 'warm-empathetic',
    },
    availability: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
      timeSlots: [{
        startTime: String,
        endTime: String,
      }],
      isAvailable: { type: Boolean, default: true },
      specificDates: [{
        date: Date,
        timeSlots: [{
          startTime: String,
          endTime: String,
        }],
        isAvailable: { type: Boolean, default: true },
      }],
    }],
    weeklyAvailability: {
      type: Schema.Types.Mixed,
      default: {
        Monday: { available: false, startTime: '09:00 AM', endTime: '05:00 PM' },
        Tuesday: { available: false, startTime: '09:00 AM', endTime: '05:00 PM' },
        Wednesday: { available: false, startTime: '09:00 AM', endTime: '05:00 PM' },
        Thursday: { available: false, startTime: '09:00 AM', endTime: '05:00 PM' },
        Friday: { available: false, startTime: '09:00 AM', endTime: '05:00 PM' },
        Saturday: { available: false, startTime: '09:00 AM', endTime: '05:00 PM' },
        Sunday: { available: false, startTime: '09:00 AM', endTime: '05:00 PM' },
      },
    },
    availabilitySlots: [{
      id: { type: String },
      date: { type: String },
      dayOfWeek: { type: String },
      startTime: { type: String },
      endTime: { type: String },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      adminNotes: { type: String },
    }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
    acceptsNewPatients: { type: Boolean, default: true },
    telehealth: { type: Boolean, default: false },
    inPerson: { type: Boolean, default: true },
    status: {
      type: String,
      enum: DoctorStatus,
      default: 'active',
    },
    profileUpdateRequest: {
      status: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none',
      },
      requestedData: { type: Schema.Types.Mixed },
      requestedAt: { type: Date },
      reviewedAt: { type: Date },
      reviewedBy: { type: String },
      adminNotes: { type: String },
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
DoctorSchema.index({ 'chamberLocation.coordinates': '2dsphere' });

// Hash password before saving
DoctorSchema.pre('save', async function () {
  const doctor = this;
  
  // Only hash the password if it has been modified (or is new)
  if (!doctor.isModified('password')) {
    return;
  }

  // Check if password exists and is not empty
  if (doctor.password) {
    doctor.password = await bcrypt.hash(
      doctor.password,
      Number(config.bcrypt_salt_rounds)
    );
  }
});

// Remove password field from response
DoctorSchema.post('save', function (doc) {
  doc.password = '';
});

// Static method to check if doctor exists by email
DoctorSchema.statics.isDoctorExistsByEmail = async function (email: string) {
  return await Doctor.findOne({ email }).select('+password');
};

// Static method to check if password matches
DoctorSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

// Static method to check if JWT is issued before password change
DoctorSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const Doctor = model<IDoctor, DoctorModel>('Doctor', DoctorSchema);
