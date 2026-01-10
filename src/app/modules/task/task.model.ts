import mongoose, { Schema } from 'mongoose';
import { ITask } from './task.interface';

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Arts and Craft',
        'Nature',
        'Family',
        'Sport',
        'Friends',
        'Meditation',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['All Task', 'Ongoing', 'Pending', 'Collaborative Task', 'Done'],
      required: true,
    },
    endDate: { type: Date, required: true },
  },
  { timestamps: true } // createdAt, updatedAt auto add হবে
);

// Export the model
export const TaskModel = mongoose.model<ITask>('TaskModel', TaskSchema);
