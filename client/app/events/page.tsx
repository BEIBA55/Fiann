'use client';

import { useQuery } from '@apollo/client';
import { EVENTS } from '@/lib/graphql/queries';
import { Header } from '@/components/Header';
import { EventCard } from '@/components/EventCard';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EventsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { data, loading, error, subscribeToMore } = useQuery(EVENTS, {
    variables: { status: 'PUBLISHED', limit: 50 },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">Loading events...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center text-red-600">Error loading events: {error.message}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">All Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.events?.map((event: any) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
        {data?.events?.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            No events available at the moment.
          </div>
        )}
      </main>
    </div>
  );
}

