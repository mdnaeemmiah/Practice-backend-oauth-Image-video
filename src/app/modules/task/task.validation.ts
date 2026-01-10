// import { z } from "zod";

// export const taskSchema = z.object({
//   title: z.string()
//     .min(3, "Title must be at least 3 characters long")
//     .max(100, "Title cannot exceed 100 characters")
//     .trim(),

//   category: z.enum([
//     'Arts and Craft',
//     'Nature',
//     'Family',
//     'Sport',
//     'Friends',
//     'Meditation'
//   ], {
//     errorMap: () => ({ message: "Please select a valid category" })
//   }),

//   status: z.enum([
//     'All Task',
//     'Ongoing',
//     'Pending',
//     'Collaborative Task',
//     'Done'
//   ], {
//     errorMap: () => ({ message: "Please select a valid status" })
//   }),

//   endDate: z.coerce.date({
//     required_error: "End date is required",
//     invalid_type_error: "End date must be a valid date",
//   }),
// });

import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),

  category: z.enum(
    [
      'Arts and Craft',
      'Nature',
      'Family',
      'Sport',
      'Friends',
      'Meditation',
    ] as const,
    {
      message: 'Please select a valid category',
    }
  ),

  status: z.enum(
    ['All Task', 'Ongoing', 'Pending', 'Collaborative Task', 'Done'] as const,
    {
      message: 'Please select a valid status',
    }
  ),

  endDate: z.coerce.date({
    message: 'End date is required',
  }),
});
