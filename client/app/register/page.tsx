'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { REGISTER } from '@/lib/graphql/mutations';
import { useAuthStore } from '@/store/auth-store';
import { Header } from '@/components/Header';

const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Неверный адрес электронной почты'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  role: z.enum(['USER', 'ORGANIZER']).optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [register, { loading, error }] = useMutation(REGISTER);
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await register({ variables: { input: data } });
      const { token, user } = result.data.register;
      setAuth(user, token);
      router.push('/events');
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Создать аккаунт</h1>
            <p className="text-gray-600">Присоединяйтесь к EventHub и начните исследовать</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Полное имя
              </label>
              <input
                {...registerField('name')}
                type="text"
                id="name"
                placeholder="John Doe"
                className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Адрес электронной почты
              </label>
              <input
                {...registerField('email')}
                type="email"
                id="email"
                placeholder="you@example.com"
                className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Пароль
              </label>
              <input
                {...registerField('password')}
                type="password"
                id="password"
                placeholder="••••••••"
                className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.password.message}
                </p>
              )}
            </div>
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
                <span className="mr-2">❌</span>
                {error.message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Создание аккаунта...
                </span>
              ) : (
                'Создать аккаунт'
              )}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Уже есть аккаунт?{' '}
            <a href="/login" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition">
              Войдите здесь
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

