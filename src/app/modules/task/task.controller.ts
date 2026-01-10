import { Request, Response } from 'express';
import { taskService } from './task.service';
import { ITask } from './task.interface';
import { sendFileToCloudinary } from '../../../utils/sendFileToCloudinary';

const createTask = async (req: Request, res: Response) => {
  try {
    const { title, category, status, endDate } = req.body;

    console.log('📝 Request Body:', req.body);
    console.log('📁 Request Files:', req.files);
    console.log('🔍 Raw values:', { title, category, status, endDate });

    // Validate and trim inputs first
    const trimmedTitle = title?.trim();
    const trimmedCategory = category?.trim();
    const trimmedStatus = status?.trim();

    if (!trimmedTitle || !trimmedCategory || !trimmedStatus || !endDate) {
      console.error('❌ Missing fields:', {
        title: trimmedTitle,
        category: trimmedCategory,
        status: trimmedStatus,
        endDate: endDate,
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields (title, category, status, endDate)',
        received: {
          title: !!trimmedTitle,
          category: !!trimmedCategory,
          status: !!trimmedStatus,
          endDate: !!endDate,
        },
      });
    }

    // Parse date - handle various formats
    const trimmedEndDate = endDate.trim();
    console.log('📅 Parsing date:', trimmedEndDate);

    const parsedDate = new Date(trimmedEndDate);
    console.log(
      '📅 Parsed date:',
      parsedDate,
      'Valid:',
      !isNaN(parsedDate.getTime())
    );

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: `Invalid date format. Received: "${trimmedEndDate}". Expected ISO format like: 2026-01-20T18:00:00.000Z`,
      });
    }

    const images: string[] = [];
    const videos: string[] = [];
    const filesArr: string[] = [];

    // Process uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Upload images to Cloudinary (check both singular and plural field names)
    if (files && (files.images || files.image)) {
      const imageFiles = files.images || files.image || [];
      console.log('🖼️ Uploading images to Cloudinary...');
      for (const file of imageFiles) {
        console.log(`Uploading image: ${file.filename}`);
        const result: any = await sendFileToCloudinary(
          file.filename,
          file.path
        );
        console.log(`✅ Image uploaded: ${result.secure_url}`);
        images.push(result.secure_url);
      }
    }

    // Upload videos to Cloudinary (check both singular and plural field names)
    if (files && (files.videos || files.video)) {
      const videoFiles = files.videos || files.video || [];
      console.log('🎥 Uploading videos to Cloudinary...');
      for (const file of videoFiles) {
        console.log(`Uploading video: ${file.filename}`);
        const result: any = await sendFileToCloudinary(
          file.filename,
          file.path
        );
        console.log(`✅ Video uploaded: ${result.secure_url}`);
        videos.push(result.secure_url);
      }
    }

    // Upload files to Cloudinary (check both singular and plural field names)
    if (files && (files.files || files.file)) {
      const filesList = files.files || files.file || [];
      console.log('📎 Uploading files to Cloudinary...');
      for (const file of filesList) {
        console.log(`Uploading file: ${file.filename}`);
        const result: any = await sendFileToCloudinary(
          file.filename,
          file.path
        );
        console.log(`✅ File uploaded: ${result.secure_url}`);
        filesArr.push(result.secure_url);
      }
    }

    // Create new task
    const newTask: ITask = {
      title: trimmedTitle,
      category: trimmedCategory,
      status: trimmedStatus,
      endDate: parsedDate,
      images,
      videos,
      files: filesArr,
    };

    console.log('💾 Saving task to database:', newTask);

    // Save the task to the database
    const result = await taskService.createTask(newTask);

    console.log('✅ Task created successfully:', result);

    res.status(201).json({ success: true, task: result });
  } catch (error: any) {
    console.error('❌ Error creating task:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const taskController = {
  createTask,
};
