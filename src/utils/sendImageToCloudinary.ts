import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import config from '../app/config';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

// Upload image to Cloudinary
export const sendImageToCloudinary = (
  imageName: string,
  imagePath: string
): Promise<Record<string, any>> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      imagePath,
      {
        public_id: imageName.replace(/\.[^/.]+$/, ''),
        folder: 'users',
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary image upload error:', error);
          return reject(error);
        }

        console.log('✅ Image uploaded to Cloudinary:', result?.secure_url);
        resolve(result!);

        // Delete local file after successful upload
        fs.unlink(imagePath, (err) => {
          if (err) console.error('⚠️ Error deleting local image:', err);
        });
      }
    );
  });
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), '/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

// File filter for images only
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/jpg',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Multer upload configuration
const multerUpload = multer({ storage, fileFilter });

// Export middleware functions
export const upload = {
  single: (fieldName: string) => multerUpload.single(fieldName),
  fields: (fields: any[]) => multerUpload.fields(fields),
  array: (fieldName: string, maxCount?: number) =>
    multerUpload.array(fieldName, maxCount),
};
