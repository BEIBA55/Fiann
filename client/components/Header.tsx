'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          EventHub
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/events"
                className="text-gray-700 hover:text-primary-600 transition"
              >
                Events
              </Link>
              {user?.role === 'ORGANIZER' || user?.role === 'ADMIN' ? (
                <Link
                  href="/events/create"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Create Event
                </Link>
              ) : null}
              <Link
                href="/profile"
                className="text-gray-700 hover:text-primary-600 transition"
              >
                Profile
              </Link>
              <span className="text-gray-600">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-primary-600 border border-primary-600 rounded hover:bg-primary-50 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

