'use client';

import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CREATE_EVENT } from '@/lib/graphql/mutations';
import { Header } from '@/components/Header';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  capacity: z.number().min(1).max(10000),
  category: z.enum([
    'CONFERENCE',
    'WORKSHOP',
    'SEMINAR',
    'NETWORKING',
    'CONCERT',
    'SPORTS',
    'OTHER',
  ]),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const [createEvent, { loading, error }] = useMutation(CREATE_EVENT);
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ORGANIZER' && user?.role !== 'ADMIN')) {
      router.push('/events');
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: EventFormData) => {
    try {
      const result = await createEvent({
        variables: {
          input: {
            ...data,
            date: new Date(data.date).toISOString(),
          },
        },
      });
      router.push(`/events/${result.data.createEvent.id}`);
    } catch (err) {
      console.error('Create event error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">Create Event</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={5}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date & Time
              </label>
              <input
                {...register('date')}
                type="datetime-local"
                id="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                {...register('location')}
                type="text"
                id="location"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                Capacity
              </label>
              <input
                {...register('capacity', { valueAsNumber: true })}
                type="number"
                id="capacity"
                min="1"
                max="10000"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                {...register('category')}
                id="category"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="CONFERENCE">Conference</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="SEMINAR">Seminar</option>
                <option value="NETWORKING">Networking</option>
                <option value="CONCERT">Concert</option>
                <option value="SPORTS">Sports</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error.message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

