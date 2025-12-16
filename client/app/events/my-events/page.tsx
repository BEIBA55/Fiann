'use client';

import { useQuery, useMutation } from '@apollo/client';
import { MY_EVENTS } from '@/lib/graphql/queries';
import { UPDATE_EVENT } from '@/lib/graphql/mutations';
import { Header } from '@/components/Header';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';

export default function MyEventsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const { data, loading, refetch } = useQuery(MY_EVENTS, {
    skip: !isAuthenticated,
  });

  const [updateEvent, { loading: updating }] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      refetch();
      alert('Статус события обновлен!');
    },
    onError: (error) => {
      alert(`Ошибка: ${error.message}`);
    },
  });

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ORGANIZER' && user?.role !== 'ADMIN')) {
      router.push('/events');
    }
  }, [isAuthenticated, user, router]);

  const handleStatusChange = (eventId: string, newStatus: string) => {
    if (confirm(`Изменить статус события на "${newStatus}"?`)) {
      updateEvent({
        variables: {
          id: eventId,
          input: { status: newStatus },
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-gray-600 font-medium">Загрузка событий...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const events = data?.myEvents || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Мои события
          </h1>
          <p className="text-xl text-gray-600">Управляйте своими событиями</p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">У вас пока нет событий</h2>
            <p className="text-gray-600 mb-6">Создайте свое первое событие!</p>
            <Link
              href="/events/create"
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-md inline-block"
            >
              Создать событие
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event: any) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <Link href={`/events/${event.id}`}>
                        <h3 className="text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
                          {event.title}
                        </h3>
                      </Link>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                          event.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : event.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-700 border border-gray-200'
                            : event.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {event.status === 'PUBLISHED'
                          ? 'ОПУБЛИКОВАНО'
                          : event.status === 'DRAFT'
                          ? 'ЧЕРНОВИК'
                          : event.status === 'CANCELLED'
                          ? 'ОТМЕНЕНО'
                          : 'ЗАВЕРШЕНО'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{format(new Date(event.date), 'PPP p')}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h-2A4 4 0 0011 16V8a4 4 0 00-4-4H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2a2 2 0 00-2-2z" />
                        </svg>
                        <span className="font-medium">
                          {event.registrationsCount} / {event.capacity} регистраций
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="font-medium capitalize">{event.category.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:min-w-[200px]">
                    {event.status === 'DRAFT' && (
                      <button
                        onClick={() => handleStatusChange(event.id, 'PUBLISHED')}
                        disabled={updating}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-md"
                      >
                        {updating ? 'Обновление...' : 'Опубликовать'}
                      </button>
                    )}
                    {event.status === 'PUBLISHED' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(event.id, 'CANCELLED')}
                          disabled={updating}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-md"
                        >
                          {updating ? 'Обновление...' : 'Отменить событие'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(event.id, 'COMPLETED')}
                          disabled={updating}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-md"
                        >
                          {updating ? 'Обновление...' : 'Завершить'}
                        </button>
                      </>
                    )}
                    {event.status === 'CANCELLED' && (
                      <button
                        onClick={() => handleStatusChange(event.id, 'PUBLISHED')}
                        disabled={updating}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-md"
                      >
                        {updating ? 'Обновление...' : 'Восстановить'}
                      </button>
                    )}
                    <Link
                      href={`/events/${event.id}`}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium text-center shadow-md"
                    >
                      Просмотреть
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

