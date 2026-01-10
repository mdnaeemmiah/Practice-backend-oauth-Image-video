import express from 'express';
import { taskController } from './task.controller';

const taskRoute = express.Router();

// Create a new task
taskRoute.post('/create', taskController.createTask);

// Get all tasks
taskRoute.get('/', taskController.getAllTasks);

// Get a single task by ID
taskRoute.get('/:id', taskController.getSingleTask);

// Update a task by ID
taskRoute.patch('/:id', taskController.updateTask);

// Delete a task by ID
taskRoute.delete('/:id', taskController.deleteTask);

export default taskRoute;
