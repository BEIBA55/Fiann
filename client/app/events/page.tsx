'use client';

import { useQuery } from '@apollo/client';
import { EVENTS } from '@/lib/graphql/queries';
import { Header } from '@/components/Header';
import { EventCard } from '@/components/EventCard';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  { value: '', label: 'Все категории' },
  { value: 'CONFERENCE', label: 'Конференция' },
  { value: 'WORKSHOP', label: 'Мастер-класс' },
  { value: 'SEMINAR', label: 'Семинар' },
  { value: 'NETWORKING', label: 'Нетворкинг' },
  { value: 'CONCERT', label: 'Концерт' },
  { value: 'SPORTS', label: 'Спорт' },
  { value: 'OTHER', label: 'Другое' },
];

export default function EventsPage() {
  const { isAuthenticated, hasHydrated, token } = useAuthStore();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const { data, loading, error } = useQuery(EVENTS, {
    variables: { 
      status: 'PUBLISHED', 
      category: selectedCategory || undefined,
      limit: 50 
    },
    skip: !hasHydrated,
  });

  useEffect(() => {
    if (hasHydrated && !isAuthenticated && !token) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, token, router]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Ошибка загрузки событий</h2>
            <p className="text-red-600">{error.message}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3">Открыть события</h1>
          <p className="text-xl text-gray-600 mb-6">Найдите удивительные события рядом с вами</p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.value
                    ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          
          {selectedCategory && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Фильтр:</span>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                {categories.find(c => c.value === selectedCategory)?.label}
              </span>
              <button
                onClick={() => setSelectedCategory('')}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Очистить фильтр
              </button>
            </div>
          )}
        </div>
        
        {data?.events?.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedCategory ? 'Нет событий в этой категории' : 'События недоступны'}
            </h2>
            <p className="text-gray-600">
              {selectedCategory 
                ? 'Попробуйте выбрать другую категорию или зайдите позже!' 
                : 'Зайдите позже для новых событий!'}
            </p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Показать все события
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Показано {data?.events?.length || 0} {data?.events?.length === 1 ? 'событие' : data?.events?.length && data.events.length < 5 ? 'события' : 'событий'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.events?.map((event: any) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

