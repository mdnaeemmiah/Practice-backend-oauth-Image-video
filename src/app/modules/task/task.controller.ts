import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { taskService } from './task.service';

// Create a new task
const createTask = catchAsync(async (req: Request, res: Response) => {
  const validatedData = req.body;

  const newTask = await taskService.createTask(validatedData);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Task created successfully!',
    data: newTask,
  });
});

// Get all tasks
const getAllTasks = catchAsync(async (_req: Request, res: Response) => {
  const tasks = await taskService.getAllTasks();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Tasks retrieved successfully',
    data: tasks,
  });
});

// Get single task by ID
const getSingleTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const task = await taskService.getSingleTask(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task retrieved successfully',
    data: task,
  });
});

// Update task
const updateTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const updatedTask = await taskService.updateTask(id, payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task updated successfully',
    data: updatedTask,
  });
});

// Delete task
const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deletedTask = await taskService.deleteTask(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task deleted successfully',
    data: deletedTask,
  });
});

export const taskController = {
  createTask,
  getAllTasks,
  getSingleTask,
  updateTask,
  deleteTask,
};
