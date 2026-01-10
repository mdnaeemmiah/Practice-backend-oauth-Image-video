import express from 'express';
import { taskController } from './task.controller';
import { upload, multerErrorHandler } from '../../../utils/sendFileToCloudinary';

const taskRoute = express.Router();

// Route for creating a task with images, videos, and other files
taskRoute.post(
  '/create',
  upload,                // Multer upload middleware for images and videos
  multerErrorHandler,    // Custom error handler for Multer
  taskController.createTask // Controller to handle the task creation
);

export default taskRoute;
