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
  const progress = (registrationsCount / capacity) * 100;
  
  return (
    <Link href={`/events/${id}`}>
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100 h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 flex-1 pr-2">{title}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
              status === 'PUBLISHED'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : status === 'DRAFT'
                ? 'bg-gray-100 text-gray-700 border border-gray-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            {status}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{description}</p>
        
        <div className="space-y-3 mt-auto">
          <div className="flex items-center text-sm text-gray-700">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{format(new Date(date), 'PPP')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-medium capitalize">{category.toLowerCase()}</span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Регистрации</span>
              <span className="text-sm font-bold text-primary-600">
                {registrationsCount} / {capacity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  progress >= 90 ? 'bg-red-500' : progress >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

