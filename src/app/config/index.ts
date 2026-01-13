import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const jwtAccessSecret =
  process.env.JWT_ACCESS_SECRET || 'access_secret_fallback_change_me';
const jwtRefreshSecret =
  process.env.JWT_REFRESH_SECRET || 'refresh_secret_fallback_change_me';
const jwtAccessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '7d';
const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const emailPort = parseInt(
  process.env.EMAIL_PORT || process.env.SMTP_PORT || '587',
  10
);

export default {
  port: process.env.PORT || '5000',
  database_url:
    process.env.DATABASE_URL ||
    process.env.DB_URL ||
    'mongodb://localhost:27017/practice_db',
  bcrypt_salt_rounds: process.env.Bcrypt_Salt_Round,
  NODE_ENV: process.env.NODE_ENV,

  // Flat JWT accessors used across the codebase
  jwt_access_secret: jwtAccessSecret,
  jwt_refresh_secret: jwtRefreshSecret,
  jwt_access_expires_in: jwtAccessExpiresIn,
  jwt_refresh_expires_in: jwtRefreshExpiresIn,

  // Structured JWT config for OAuth utilities
  jwt: {
    accessSecret: jwtAccessSecret,
    refreshSecret: jwtRefreshSecret,
    accessExpiresIn: jwtAccessExpiresIn,
    refreshExpiresIn: jwtRefreshExpiresIn,
  },

  // OAuth provider configuration
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL ||
        'https://practice-backend-oauth-image-video.vercel.app/api/oauth/google/callback',
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || '',
      teamId: process.env.APPLE_TEAM_ID || '',
      keyId: process.env.APPLE_KEY_ID || '',
      privateKey: process.env.APPLE_PRIVATE_KEY || '',
      callbackUrl:
        process.env.APPLE_CALLBACK_URL ||
        'https://practice-backend-oauth-image-video.vercel.app/api/oauth/apple/callback',
    },
  },

  // Frontend redirect origin
  frontend: {
    url: process.env.FRONTEND_URL || 'https://frontend-chi-indol-85.vercel.app',
  },

  // Email credentials and transport configuration
  email_user: process.env.EMAIL_USER || process.env.SMTP_USER,
  email_pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
  email_host:
    process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
  email_port: Number.isNaN(emailPort) ? 587 : emailPort,
  reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,

  // Cloudinary credentials
  cloudinary_cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
};
