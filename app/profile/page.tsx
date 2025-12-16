'use client';

import { useQuery } from '@apollo/client';
import { ME, MY_REGISTRATIONS } from '@/lib/graphql/queries';
import { Header } from '@/components/Header';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { data, loading } = useQuery(ME, {
    skip: !isAuthenticated,
  });
  const { data: registrationsData } = useQuery(MY_REGISTRATIONS, {
    skip: !isAuthenticated,
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
        <main className="container mx-auto px-4 py-12">Loading...</main>
      </div>
    );
  }

  const user = data?.me;
  const registrations = registrationsData?.myRegistrations || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h1 className="text-3xl font-bold mb-4">Profile</h1>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Name:</span> {user?.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user?.email}
              </p>
              <p>
                <span className="font-semibold">Role:</span> {user?.role}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">My Registrations</h2>
            {registrations.length === 0 ? (
              <p className="text-gray-500">No registrations yet.</p>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg: any) => (
                  <div key={reg.id} className="border-b pb-4">
                    <h3 className="font-semibold text-lg">{reg.event.title}</h3>
                    <p className="text-gray-600">
                      {format(new Date(reg.event.date), 'PPP')} - {reg.event.location}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded text-sm ${
                        reg.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : reg.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

