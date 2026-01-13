import { IDoctor } from './doctor.interface';
import { Doctor } from './doctor.model';
import { sendImageToCloudinary, sendVideoToCloudinary } from '../../../utils/sendImageToCloudinary';

const getAllDoctors = async () => {
  const result = await Doctor.find();
  return result;
};

const getSingleDoctor = async (id: string) => {
  const result = await Doctor.findById(id);
  return result;
};

const createDoctor = async (file: any, data: IDoctor) => {
  if (file) {
    const imageName = `${data.email}-${Date.now()}`;
    const path = file?.path;
    const uploadResult: any = await sendImageToCloudinary(imageName, path);
    data.profileImg = uploadResult?.secure_url;
  }

  const result = await Doctor.create(data);
  return result;
};

const updateDoctor = async (id: string, file: any, data: Partial<IDoctor>) => {
  if (file) {
    const imageName = `${data.email || id}-${Date.now()}`;
    const path = file?.path;
    const uploadResult: any = await sendImageToCloudinary(imageName, path);
    data.profileImg = uploadResult?.secure_url;
  }

  const result = await Doctor.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return result;
};

const updateDoctorProfile = async (email: string, data: Partial<IDoctor>) => {
  // Instead of directly updating, create a profile update request
  const doctor: any = await Doctor.findOne({ email });
  
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  // Store the requested changes
  doctor.profileUpdateRequest = {
    status: 'pending',
    requestedData: data,
    requestedAt: new Date(),
    reviewedAt: undefined,
    reviewedBy: undefined,
    adminNotes: undefined,
  };

  await doctor.save();
  return doctor;
};

const uploadIntroVideo = async (email: string, file: any) => {
  if (!file) {
    throw new Error('No video file provided');
  }

  const videoName = `doctor-intro-${email}-${Date.now()}`;
  const path = file?.path;
  const uploadResult: any = await sendVideoToCloudinary(videoName, path);

  const result = await Doctor.findOneAndUpdate(
    { email },
    { introVideo: uploadResult?.secure_url },
    { new: true }
  );

  return result;
};

const updateAvailability = async (email: string, updateData: any) => {
  const result = await Doctor.findOneAndUpdate(
    { email },
    updateData,
    { new: true }
  );
  return result;
};

const deleteDoctor = async (id: string) => {
  const result = await Doctor.findByIdAndDelete(id);
  return result;
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await Doctor.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const getDoctorsBySpecialization = async (specialization: string) => {
  const result = await Doctor.find({ specialization });
  return result;
};

const searchDoctorsByLocation = async (
  latitude: number,
  longitude: number,
  radiusInKm: number,
  filters?: {
    specialization?: string;
    careMode?: 'in-person' | 'virtual' | 'both';
    communicationStyle?: string;
    languages?: string[];
    vibeTags?: string[];
  }
) => {
  const radiusInMeters = radiusInKm * 1000;

  // Build query
  const query: any = {
    'chamberLocation.coordinates.coordinates': {
      $exists: true,
      $ne: [0, 0], // Exclude default [0, 0] coordinates
    },
    isDeleted: false,
    status: 'active',
    acceptsNewPatients: true,
  };

  // Add geospatial query
  query['chamberLocation.coordinates'] = {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      $maxDistance: radiusInMeters,
    },
  };

  // Add filters
  if (filters?.specialization) {
    query.specialization = filters.specialization;
  }

  if (filters?.careMode) {
    if (filters.careMode === 'in-person') {
      query.inPerson = true;
    } else if (filters.careMode === 'virtual') {
      query.telehealth = true;
    } else if (filters.careMode === 'both') {
      query.$or = [{ inPerson: true }, { telehealth: true }];
    }
  }

  if (filters?.communicationStyle) {
    query.communicationStyle = filters.communicationStyle;
  }

  if (filters?.languages && filters.languages.length > 0) {
    query.languages = { $in: filters.languages };
  }

  if (filters?.vibeTags && filters.vibeTags.length > 0) {
    query.vibeTags = { $in: filters.vibeTags };
  }

  try {
    const result = await Doctor.find(query).select('-password -verificationCode');
    
    // Calculate distance for each doctor
    const doctorsWithDistance = result.map((doctor: any) => {
      const docObj = doctor.toObject();
      if (docObj.chamberLocation?.coordinates?.coordinates) {
        const [docLng, docLat] = docObj.chamberLocation.coordinates.coordinates;
        const distance = calculateDistance(latitude, longitude, docLat, docLng);
        return {
          ...docObj,
          distance: parseFloat(distance.toFixed(2)), // in km
        };
      }
      return docObj;
    });

    return doctorsWithDistance;
  } catch (error) {
    console.error('Geospatial search error:', error);
    // Return empty array if geospatial search fails
    return [];
  }
};

// Helper function to calculate distance using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

const updateAvailabilitySlotStatus = async (
  doctorId: string,
  slotId: string,
  status: string,
  adminNotes?: string
) => {
  const doctor: any = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const slotIndex = doctor.availabilitySlots?.findIndex(
    (slot: any) => slot.id === slotId
  );

  if (slotIndex === -1 || slotIndex === undefined) {
    throw new Error('Availability slot not found');
  }

  doctor.availabilitySlots[slotIndex].status = status;
  if (adminNotes) {
    doctor.availabilitySlots[slotIndex].adminNotes = adminNotes;
  }

  await doctor.save();
  return doctor;
};

const approveProfileUpdate = async (
  doctorId: string,
  adminEmail: string,
  adminNotes?: string
) => {
  const doctor: any = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  if (!doctor.profileUpdateRequest || doctor.profileUpdateRequest.status !== 'pending') {
    throw new Error('No pending profile update request');
  }

  // Apply the requested changes
  const requestedData = doctor.profileUpdateRequest.requestedData;
  Object.assign(doctor, requestedData);

  // Update request status
  doctor.profileUpdateRequest = {
    status: 'approved',
    requestedData: requestedData,
    requestedAt: doctor.profileUpdateRequest.requestedAt,
    reviewedAt: new Date(),
    reviewedBy: adminEmail,
    adminNotes: adminNotes,
  };

  await doctor.save();
  return doctor;
};

const rejectProfileUpdate = async (
  doctorId: string,
  adminEmail: string,
  adminNotes: string
) => {
  const doctor: any = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  if (!doctor.profileUpdateRequest || doctor.profileUpdateRequest.status !== 'pending') {
    throw new Error('No pending profile update request');
  }

  // Update request status without applying changes
  doctor.profileUpdateRequest = {
    status: 'rejected',
    requestedData: doctor.profileUpdateRequest.requestedData,
    requestedAt: doctor.profileUpdateRequest.requestedAt,
    reviewedAt: new Date(),
    reviewedBy: adminEmail,
    adminNotes: adminNotes,
  };

  await doctor.save();
  return doctor;
};

export const doctorService = {
  getAllDoctors,
  getSingleDoctor,
  createDoctor,
  updateDoctor,
  updateDoctorProfile,
  uploadIntroVideo,
  updateAvailability,
  deleteDoctor,
  changeStatus,
  getDoctorsBySpecialization,
  searchDoctorsByLocation,
  updateAvailabilitySlotStatus,
  approveProfileUpdate,
  rejectProfileUpdate,
};
