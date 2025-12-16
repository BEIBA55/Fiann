'use client';

import { useQuery, useMutation } from '@apollo/client';
import { ME, MY_REGISTRATIONS } from '@/lib/graphql/queries';
import { CANCEL_REGISTRATION } from '@/lib/graphql/mutations';
import { Header } from '@/components/Header';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { isAuthenticated, hasHydrated, token } = useAuthStore();
  const router = useRouter();
  const { data, loading } = useQuery(ME, {
    skip: !hasHydrated || !isAuthenticated,
  });
  const { data: registrationsData, refetch: refetchRegistrations } = useQuery(MY_REGISTRATIONS, {
    skip: !hasHydrated || !isAuthenticated,
  });

  const [cancelRegistration, { loading: canceling }] = useMutation(CANCEL_REGISTRATION, {
    onCompleted: () => {
      refetchRegistrations();
    },
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
              <p className="text-lg text-gray-600 font-medium">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const user = data?.me;
  const registrations = registrationsData?.myRegistrations || [];

  const handleCancelRegistration = async (registrationId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to cancel your registration for "${eventTitle}"?`)) {
      return;
    }
    
    try {
      await cancelRegistration({
        variables: { id: registrationId },
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-6 border border-gray-100">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{user?.role.toLowerCase()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100">
            <h2 className="text-3xl font-bold mb-6">My Registrations</h2>
            {registrations.length === 0 ? (
              <p className="text-gray-500">No registrations yet.</p>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg: any) => (
                  <div key={reg.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{reg.event.title}</h3>
                        <p className="text-gray-600 mb-2">
                          {format(new Date(reg.event.date), 'PPP')} - {reg.event.location}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            reg.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : reg.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </div>
                      {reg.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelRegistration(reg.id, reg.event.title)}
                          disabled={canceling}
                          className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all transform hover:scale-105 font-medium text-sm whitespace-nowrap"
                        >
                          {canceling ? 'Canceling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
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

