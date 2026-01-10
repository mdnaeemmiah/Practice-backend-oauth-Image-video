// task.interface.ts

export type TaskCategory =
  | 'Arts and Craft'
  | 'Nature'
  | 'Family'
  | 'Sport'
  | 'Friends'
  | 'Meditation';

export type TaskStatus =
  | 'All Task'
  | 'Ongoing'
  | 'Pending'
  | 'Collaborative Task'
  | 'Done';

export interface ITask {
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  endDate: Date;
  [key: string]: any; // optional extension
}
