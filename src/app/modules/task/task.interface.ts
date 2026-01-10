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

  // New fields for media
  images?: string[]; // array of Cloudinary image URLs
  videos?: string[]; // array of Cloudinary video URLs
  files?: string[];  // array of Cloudinary file URLs or any storage URL

  [key: string]: any; // optional extension
}
