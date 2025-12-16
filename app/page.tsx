import { Header } from '@/components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to EventHub
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover and manage amazing events
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/events"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-lg"
            >
              Browse Events
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition text-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

