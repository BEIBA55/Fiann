'use client';

import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CREATE_EVENT, UPDATE_EVENT } from '@/lib/graphql/mutations';
import { Header } from '@/components/Header';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';

const eventSchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов'),
  date: z.string().min(1, 'Дата обязательна').refine(
    (val) => {
      if (!val) return false;
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    },
    { message: 'Дата должна быть в будущем' }
  ),
  location: z.string().min(3, 'Место должно содержать минимум 3 символа'),
  capacity: z.number().min(1, 'Вместимость должна быть минимум 1').max(10000, 'Вместимость не может превышать 10000'),
  category: z.enum([
    'CONFERENCE',
    'WORKSHOP',
    'SEMINAR',
    'NETWORKING',
    'CONCERT',
    'SPORTS',
    'OTHER',
  ], { errorMap: () => ({ message: 'Выберите категорию' }) }),
  publishImmediately: z.boolean().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const [createEvent, { loading, error }] = useMutation(CREATE_EVENT);
  const [updateEvent] = useMutation(UPDATE_EVENT);
  const router = useRouter();
  const { isAuthenticated, hasHydrated, token, user } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    if (hasHydrated) {
      if (!isAuthenticated && !token) {
        router.push('/login');
      } else if (isAuthenticated && user?.role !== 'ORGANIZER' && user?.role !== 'ADMIN') {
        router.push('/events');
      }
    }
  }, [hasHydrated, isAuthenticated, token, user, router]);

  const onSubmit = async (data: EventFormData) => {
    try {
      // Convert datetime-local format (YYYY-MM-DDTHH:mm) to ISO string
      // datetime-local returns local time without timezone, so we need to convert it properly
      const dateValue = data.date;
      let isoDate: string;
      
      if (dateValue && dateValue.includes('T')) {
        // Create Date object from local datetime string
        const localDate = new Date(dateValue);
        
        // Проверка, что дата в будущем
        if (localDate <= new Date()) {
          alert('Дата события должна быть в будущем!');
          return;
        }
        
        // Convert to ISO string
        isoDate = localDate.toISOString();
      } else {
        isoDate = dateValue;
      }
      
      // Исключаем publishImmediately из данных для createEvent
      const { publishImmediately, ...eventInput } = data;
      
      const result = await createEvent({
        variables: {
          input: {
            ...eventInput,
            date: isoDate,
          },
        },
      });

      if (data.publishImmediately) {
        await updateEvent({
          variables: {
            id: result.data.createEvent.id,
            input: { status: 'PUBLISHED' },
          },
        });
      }

      router.push(`/events/${result.data.createEvent.id}`);
    } catch (err: any) {
      console.error('Create event error:', err);
      
      // Улучшенная обработка ошибок
      let errorMessage = 'Не удалось создать событие';
      
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        // GraphQL ошибки
        const graphQLError = err.graphQLErrors[0];
        errorMessage = graphQLError.message || errorMessage;
        
        // Если ошибка валидации, показываем детали
        if (graphQLError.extensions?.code === 'VALIDATION_ERROR') {
          try {
            const validationErrors = JSON.parse(graphQLError.message);
            if (Array.isArray(validationErrors)) {
              const errorDetails = validationErrors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('\n');
              errorMessage = `Ошибка валидации:\n${errorDetails}`;
            }
          } catch {
            // Если не удалось распарсить, используем обычное сообщение
          }
        }
      } else if (err.networkError) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">Создать событие</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Название
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
                Описание
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
                Дата и время
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
                Место
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
                Вместимость
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
                Категория
              </label>
              <select
                {...register('category')}
                id="category"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="CONFERENCE">Конференция</option>
                <option value="WORKSHOP">Мастер-класс</option>
                <option value="SEMINAR">Семинар</option>
                <option value="NETWORKING">Нетворкинг</option>
                <option value="CONCERT">Концерт</option>
                <option value="SPORTS">Спорт</option>
                <option value="OTHER">Другое</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
            <div className="flex items-center">
              <input
                {...register('publishImmediately')}
                type="checkbox"
                id="publishImmediately"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="publishImmediately" className="ml-2 block text-sm text-gray-700">
                Опубликовать сразу
              </label>
            </div>
            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg">
                <div className="font-semibold mb-1">Ошибка создания события:</div>
                <div className="text-sm">
                  {String(error.graphQLErrors?.[0]?.message || error.message || 'Неизвестная ошибка')}
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать событие'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}


