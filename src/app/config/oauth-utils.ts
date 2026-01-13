// import { User } from '../modules/user/user.model';
// import jwt from 'jsonwebtoken';
// import config from '.';

// export const generateTokens = (userId: string) => {
//   const accessToken = jwt.sign(
//     { userId }, 
//     config.jwt.accessSecret as string,
//     { expiresIn: config.jwt.accessExpiresIn }
//   );

//   const refreshToken = jwt.sign(
//     { userId }, 
//     config.jwt.refreshSecret as string,
//     { expiresIn: config.jwt.refreshExpiresIn }
//   );

//   return { accessToken, refreshToken };
// };

// export const findOrCreateUser = async (
//   profile: any,
//   provider: 'google' | 'apple'
// ) => {
//   let user = await User.findOne({ email: profile.email });

//   if (!user) {
//     const firstName =
//       profile.given_name ||
//       profile.firstName ||
//       profile.name?.split(' ')[0] ||
//       '';
//     const lastName =
//       profile.family_name ||
//       profile.lastName ||
//       profile.name?.split(' ').slice(1).join(' ') ||
//       '';
//     const fullName = `${firstName} ${lastName}`.trim() || 'User';

//     user = new User({
//       firstName,
//       lastName,
//       name: fullName,
//       email: profile.email,
//       profileImage: profile.picture || null,
//       password: null,
//       provider: provider,
//       providerId: profile.id,
//       isEmailVerified: true,
//       needsPasswordChange: false,
//     });
//     await user.save();
//   } else if (!user.provider) {
//     // Update existing user with provider info
//     user.provider = provider;
//     user.providerId = profile.id;
//     user.isEmailVerified = true;
//     await user.save();
//   }

//   return user;
// };


import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User } from '../modules/user/user.model';
import config from '../config';

/* =========================
   Generate Access & Refresh Tokens
========================= */
export const generateTokens = (userId: string) => {
  if (!config.jwt.accessSecret || !config.jwt.refreshSecret) {
    throw new Error('JWT secrets are not defined');
  }

  const accessToken = jwt.sign(
    { userId },
    config.jwt.accessSecret as Secret,
    {
      expiresIn: config.jwt.accessExpiresIn as SignOptions['expiresIn'],
    }
  );

  const refreshToken = jwt.sign(
    { userId },
    config.jwt.refreshSecret as Secret,
    {
      expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'],
    }
  );

  return {
    accessToken,
    refreshToken,
  };
};

/* =========================
   Find or Create OAuth User
========================= */
export const findOrCreateUser = async (
  profile: any,
  provider: 'google' | 'apple'
) => {
  let user = await User.findOne({ email: profile.email });

  if (!user) {
    const firstName =
      profile.given_name ||
      profile.firstName ||
      profile.name?.split(' ')[0] ||
      '';

    const lastName =
      profile.family_name ||
      profile.lastName ||
      profile.name?.split(' ').slice(1).join(' ') ||
      '';

    const fullName = `${firstName} ${lastName}`.trim() || 'User';

    user = new User({
      firstName,
      lastName,
      name: fullName,
      email: profile.email,
      profileImage: profile.picture || null,
      password: null,
      provider,
      providerId: profile.id,
      isEmailVerified: true,
      needsPasswordChange: false,
    });

    await user.save();
  } else if (!user.provider) {
    // If user existed but signed up normally
    user.provider = provider;
    user.providerId = profile.id;
    user.isEmailVerified = true;
    await user.save();
  }

  return user;
};
