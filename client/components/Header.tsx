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
    <header className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-100">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
          EventHub
        </Link>
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link
                href="/events"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium relative group"
              >
                События
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all"></span>
              </Link>
              {user?.role === 'ORGANIZER' || user?.role === 'ADMIN' ? (
                <>
                  <Link
                    href="/events/my-events"
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium relative group"
                  >
                    Настройка
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all"></span>
                  </Link>
                  <Link
                    href="/events/create"
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium relative group"
                  >
                    Создать событие
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all"></span>
                  </Link>
                </>
              ) : null}
              <Link
                href="/profile"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium relative group"
              >
                Профиль
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all"></span>
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
                >
                  Выйти
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-all font-medium"
              >
                Логин
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

