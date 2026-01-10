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

console.log('🔧 Cloudinary Config:', {
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key
    ? '***' + config.cloudinary_api_key.slice(-4)
    : 'MISSING',
  api_secret: config.cloudinary_api_secret ? '***set***' : 'MISSING',
});

// Upload file to Cloudinary
export const sendFileToCloudinary = (fileName: string, filePath: string) => {
  console.log(`📤 Uploading to Cloudinary: ${fileName} from ${filePath}`);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        public_id: fileName.replace(/\.[^/.]+$/, ''), // Remove extension from public_id
        resource_type: 'auto', // 'auto' lets Cloudinary automatically detect file type (image/video)
        folder: 'tasks', // Optional: organize uploads in a folder
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          return reject(error);
        }

        console.log('✅ Cloudinary upload success:', result?.secure_url);
        resolve(result);

        // Delete local file after successful upload
        fs.unlink(filePath, (err) => {
          if (err) console.error('⚠️ Error deleting local file:', err);
          else console.log('🗑️ Local file deleted:', filePath);
        });
      }
    );
  });
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), '/uploads');
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });
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

// Allowed file extensions and mime types for images, videos, and documents
const allowedExtensions =
  /\.(jpeg|jpg|png|gif|webp|svg|mp4|mov|avi|webm|pdf|doc|docx|xls|xlsx|txt)$/i;
const allowedMimeTypes = new Set<string>([
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/avi',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]);

// File filter function to accept images, videos, and documents
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  console.log(
    `📋 Validating file: ${file.originalname}, mimetype: ${file.mimetype}`
  );

  const isAllowed =
    allowedExtensions.test(file.originalname) ||
    allowedMimeTypes.has(file.mimetype);

  if (isAllowed) {
    console.log(`✅ File accepted: ${file.originalname}`);
    cb(null, true);
  } else {
    console.log(`❌ File rejected: ${file.originalname}`);
    cb(
      new Error(
        `File type not allowed. Accepted: images, videos, documents (PDF, DOC, XLS)`
      )
    );
  }
};

// Multer configuration for uploading multiple images and videos (with a max count for each)
// Accept both singular and plural field names
export const upload = multer({ storage, fileFilter }).fields([
  { name: 'images', maxCount: 5 }, // Limit to 5 images
  { name: 'image', maxCount: 5 }, // Alternative singular name
  { name: 'videos', maxCount: 5 }, // Limit to 5 videos
  { name: 'video', maxCount: 5 }, // Alternative singular name
  { name: 'files', maxCount: 5 }, // Limit to 5 files
  { name: 'file', maxCount: 5 }, // Alternative singular name
]);

// Error handler middleware for multer
export const multerErrorHandler = (err: any, req: any, res: any, next: any) => {
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
      errorSources: [
        {
          path: '',
          message: err.message || 'File upload error',
        },
      ],
      err: {
        storageErrors: [],
      },
      stack: err.stack,
    });
  }
  next();
};
