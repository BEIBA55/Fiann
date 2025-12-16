'use client';

import Link from 'next/link';
import { format } from 'date-fns';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  status: string;
  registrationsCount: number;
  capacity: number;
}

export function EventCard({
  id,
  title,
  description,
  date,
  location,
  category,
  status,
  registrationsCount,
  capacity,
}: EventCardProps) {
  return (
    <Link href={`/events/${id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <span
            className={`px-2 py-1 rounded text-xs ${
              status === 'PUBLISHED'
                ? 'bg-green-100 text-green-800'
                : status === 'DRAFT'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {status}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium">📅</span>
            <span className="ml-2">
              {format(new Date(date), 'PPP p')}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium">📍</span>
            <span className="ml-2">{location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium">🏷️</span>
            <span className="ml-2">{category}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium">👥</span>
            <span className="ml-2">
              {registrationsCount} / {capacity} registered
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

