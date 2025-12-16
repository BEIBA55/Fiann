'use client';

import { Header } from '@/components/Header';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to EventHub
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4">
              Discover and manage amazing events
            </p>
            <p className="text-lg text-gray-500">
              Connect with your community, explore new opportunities, and create unforgettable experiences
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/events"
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl text-lg font-semibold"
            >
              Browse Events
            </Link>
            {!isAuthenticated && (
              <Link
                href="/login"
                className="px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 transition-all transform hover:scale-105 text-lg font-semibold"
              >
                Get Started
              </Link>
            )}
          </div>

          
        </div>
      </main>
    </div>
  );
}

