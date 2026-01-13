import { Doctor } from '../doctor/doctor.model';
import { Patient } from '../patient/patient.model';
import { IMatchCriteria, IMatchResult } from './matching.interface';
import { doctorService } from '../doctor/doctor.service';

class MatchingService {
  async findMatches(criteria: IMatchCriteria): Promise<IMatchResult[]> {
    const { preferences, userLocation } = criteria;
    
    let doctors: any[] = [];

    // Use location from preferences or userLocation parameter
    const latitude = userLocation?.latitude || preferences.location.latitude;
    const longitude = userLocation?.longitude || preferences.location.longitude;
    const radiusInKm = preferences.location.radius; // Already in km

    // Try geospatial search first
    if (latitude && longitude) {
      try {
        doctors = await doctorService.searchDoctorsByLocation(
          latitude,
          longitude,
          radiusInKm,
          {
            specialization: preferences.careType !== 'other' 
              ? this.mapCareTypeToSpecialization(preferences.careType) 
              : undefined,
            careMode: preferences.careMode,
            communicationStyle: preferences.communicationStyle !== 'no-preference' 
              ? preferences.communicationStyle 
              : undefined,
            languages: preferences.languagePreferences,
            vibeTags: preferences.vibePreferences,
          }
        );
      } catch (error) {
        console.error('Geospatial search failed, falling back to basic query:', error);
      }
    }

    // Fallback: If no results from geospatial search or search failed, use basic query
    if (doctors.length === 0) {
      const query: any = {
        status: 'active',
        isVerified: true,
        isDeleted: { $ne: true },
        acceptsNewPatients: true,
      };

      if (preferences.careType !== 'other') {
        query.specialization = this.mapCareTypeToSpecialization(preferences.careType);
      }

      if (preferences.careMode === 'virtual') {
        query.telehealth = true;
      } else if (preferences.careMode === 'in-person') {
        query.inPerson = true;
      }

      if (preferences.languagePreferences?.length > 0) {
        query.languages = { $in: preferences.languagePreferences };
      }

      if (preferences.communicationStyle !== 'no-preference') {
        query.communicationStyle = preferences.communicationStyle;
      }

      if (preferences.vibePreferences?.length > 0) {
        query.vibeTags = { $in: preferences.vibePreferences };
      }

      doctors = await Doctor.find(query).limit(20);
    }

    // If still no results, get any active doctors
    if (doctors.length === 0) {
      doctors = await Doctor.find({
        status: 'active',
        isVerified: true,
        isDeleted: { $ne: true },
        acceptsNewPatients: true,
      }).limit(20);
    }

    // Calculate match scores
    const matchResults: IMatchResult[] = doctors.map(doctor => {
      const score = this.calculateMatchScore(doctor, preferences, userLocation);
      const reasons = this.generateMatchReasons(doctor, preferences);
      
      return {
        doctorId: doctor._id.toString(),
        matchScore: score,
        matchReasons: reasons,
        distance: doctor.distance, // Include distance if available
      };
    });

    // Sort by match score and return top 3
    return matchResults
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  }

  private mapCareTypeToSpecialization(careType: string): string {
    const mapping: { [key: string]: string } = {
      'primary-care': 'General Medicine',
      'ob-gyn': 'Obstetrics and Gynecology',
      'mental-health': 'Psychiatry',
      'dermatology': 'Dermatology',
      'cardiology': 'Cardiology',
    };
    return mapping[careType] || careType;
  }

  private calculateMatchScore(doctor: any, preferences: any, userLocation?: { latitude: number; longitude: number }): number {
    let score = 0;
    const maxScore = 100;

    // Specialization match (30 points)
    if (preferences.careType !== 'other') {
      const expectedSpec = this.mapCareTypeToSpecialization(preferences.careType);
      if (doctor.specialization === expectedSpec) {
        score += 30;
      }
    }

    // Communication style match (20 points)
    if (preferences.communicationStyle !== 'no-preference' && 
        doctor.communicationStyle === preferences.communicationStyle) {
      score += 20;
    }

    // Language match (15 points)
    if (preferences.languagePreferences?.length > 0) {
      const commonLanguages = doctor.languages?.filter((lang: string) => 
        preferences.languagePreferences.includes(lang)
      ) || [];
      score += Math.min(15, commonLanguages.length * 7);
    }

    // Vibe tags match (15 points)
    if (preferences.vibePreferences?.length > 0) {
      const commonVibes = doctor.vibeTags?.filter((vibe: string) => 
        preferences.vibePreferences.includes(vibe)
      ) || [];
      score += Math.min(15, commonVibes.length * 5);
    }

    // Care mode compatibility (10 points)
    if (preferences.careMode === 'virtual' && doctor.telehealth) {
      score += 10;
    } else if (preferences.careMode === 'in-person' && doctor.inPerson) {
      score += 10;
    } else if (preferences.careMode === 'both' && doctor.telehealth && doctor.inPerson) {
      score += 10;
    }

    // Distance bonus (10 points) - closer is better
    if (doctor.distance !== undefined) {
      const maxDistance = preferences.location.radius; // Already in km
      const distanceScore = Math.max(0, 10 - (doctor.distance / maxDistance) * 10);
      score += distanceScore;
    }

    return Math.min(score, maxScore);
  }

  private generateMatchReasons(doctor: any, preferences: any): string[] {
    const reasons: string[] = [];

    if (preferences.careType !== 'other') {
      const expectedSpec = this.mapCareTypeToSpecialization(preferences.careType);
      if (doctor.specialization === expectedSpec) {
        reasons.push(`Specializes in ${doctor.specialization}`);
      }
    }

    if (doctor.distance !== undefined) {
      reasons.push(`${doctor.distance.toFixed(1)} km away from you`);
    }

    if (preferences.communicationStyle !== 'no-preference' && 
        doctor.communicationStyle === preferences.communicationStyle) {
      const styleMap: any = {
        'warm-empathetic': 'warm & empathetic',
        'direct-efficient': 'direct & efficient',
        'collaborative': 'collaborative',
      };
      reasons.push(`${styleMap[preferences.communicationStyle]} communication style`);
    }

    if (preferences.languagePreferences?.length > 0) {
      const commonLanguages = doctor.languages?.filter((lang: string) => 
        preferences.languagePreferences.includes(lang)
      ) || [];
      if (commonLanguages.length > 0) {
        reasons.push(`Speaks ${commonLanguages.join(', ')}`);
      }
    }

    if (preferences.vibePreferences?.length > 0) {
      const commonVibes = doctor.vibeTags?.filter((vibe: string) => 
        preferences.vibePreferences.includes(vibe)
      ) || [];
      if (commonVibes.length > 0) {
        reasons.push(`${commonVibes.map((v: string) => v.replace('-', ' ')).join(', ')}`);
      }
    }

    if (doctor.rating && doctor.rating >= 4.5) {
      reasons.push(`Highly rated (${doctor.rating}/5 stars)`);
    }

    if (doctor.experience && doctor.experience >= 10) {
      reasons.push(`${doctor.experience}+ years of experience`);
    }

    if (preferences.careMode === 'virtual' && doctor.telehealth) {
      reasons.push('Offers virtual appointments');
    } else if (preferences.careMode === 'in-person' && doctor.inPerson) {
      reasons.push('Offers in-person appointments');
    } else if (preferences.careMode === 'both' && doctor.telehealth && doctor.inPerson) {
      reasons.push('Offers both virtual and in-person care');
    }

    return reasons.slice(0, 5); // Limit to top 5 reasons
  }
}

export const matchingService = new MatchingService();