import { z } from 'zod';

export const registerInputSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['USER', 'ORGANIZER', 'ADMIN']).optional(),
});

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createEventInputSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  date: z.union([
    z.string(),
    z.date(),
  ]).refine(
    (val) => {
      const date = val instanceof Date ? val : new Date(val);
      return !isNaN(date.getTime());
    },
    { message: 'Invalid date format' }
  ),
  location: z.string().min(3).max(200),
  capacity: z.number().int().min(1).max(10000),
  category: z.enum([
    'CONFERENCE',
    'WORKSHOP',
    'SEMINAR',
    'NETWORKING',
    'CONCERT',
    'SPORTS',
    'OTHER',
  ]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
  imageUrl: z.string().url().optional(),
});

export const updateEventInputSchema = createEventInputSchema.partial();

export const createRegistrationInputSchema = z.object({
  eventId: z.string(),
  notes: z.string().max(500).optional(),
});

export const updateRegistrationInputSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED']).optional(),
  notes: z.string().max(500).optional(),
});

export const createCommentInputSchema = z.object({
  eventId: z.string(),
  content: z.string().min(1).max(1000),
  rating: z.number().int().min(1).max(5).optional(),
});

export const updateCommentInputSchema = z.object({
  content: z.string().min(1).max(1000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export const updateUserInputSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'ORGANIZER', 'ADMIN']).optional(),
});

